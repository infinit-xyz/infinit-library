// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../common/library/InitErrors.sol';
import '../common/library/UncheckedIncrement.sol';
import {UnderACM} from '../common/UnderACM.sol';
import {IInitCore} from '../interfaces/core/IInitCore.sol';
import {IMulticall} from '../interfaces/common/IMulticall.sol';
import {IPosManager} from '../interfaces/core/IPosManager.sol';
import {ILendingPool} from '../interfaces/lending_pool/ILendingPool.sol';
import {IWNative} from '../interfaces/common/IWNative.sol';
import {IRebaseHelper} from '../interfaces/helper/rebase_helper/IRebaseHelper.sol';
import {IMoneyMarketHook} from '../interfaces/hook/IMoneyMarketHook.sol';

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {IERC721} from '@openzeppelin-contracts/token/ERC721/IERC721.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';
import {ERC721HolderUpgradeable} from '@openzeppelin-contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol';
import {ReentrancyGuardUpgradeable} from '@openzeppelin-contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';

// NOTE: only support normal money market actions (deposit, withdraw, borrow, repay, change position mode)
// doesn't support wLp
contract MoneyMarketHook is IMoneyMarketHook, ERC721HolderUpgradeable, ReentrancyGuardUpgradeable, UnderACM {
    using UncheckedIncrement for uint;
    using SafeERC20 for IERC20;

    // constants
    bytes32 private constant GUARDIAN = keccak256('guardian');

    // immutables
    /// @inheritdoc IMoneyMarketHook
    address public immutable CORE;
    /// @inheritdoc IMoneyMarketHook
    address public immutable POS_MANAGER;
    /// @inheritdoc IMoneyMarketHook
    address public immutable WNATIVE;

    // storages
    /// @inheritdoc IMoneyMarketHook
    mapping(address => uint) public lastPosIds;
    /// @inheritdoc IMoneyMarketHook
    mapping(address => mapping(uint => uint)) public initPosIds;
    /// @inheritdoc IMoneyMarketHook
    mapping(address => bool) public whitelistedHelpers;

    // modifiers
    modifier onlyGuardian() {
        ACM.checkRole(GUARDIAN, msg.sender);
        _;
    }

    // constructor
    constructor(address _initCore, address _wNative, address _acm) UnderACM(_acm) {
        CORE = _initCore;
        POS_MANAGER = IInitCore(_initCore).POS_MANAGER();
        WNATIVE = _wNative;
        _disableInitializers();
    }

    // initialize
    /// @dev initialize the contract
    function initialize() external initializer {
        __ReentrancyGuard_init();
    }

    // functions
    /// @inheritdoc IMoneyMarketHook
    function execute(OperationParams calldata _params)
        external
        payable
        nonReentrant
        returns (uint posId, uint initPosId, bytes[] memory results)
    {
        // create position if not exist
        if (_params.posId == 0) {
            (posId, initPosId) = createPos(_params.mode, _params.viewer);
        } else {
            // for existing position, only owner can execute
            posId = _params.posId;
            initPosId = initPosIds[msg.sender][posId];
            _require(IERC721(POS_MANAGER).ownerOf(initPosId) == address(this), Errors.NOT_OWNER);
        }
        // NOTE: msg.value should be used for 1 operation only
        results = _handleMulticall(initPosId, _params);
        // check slippage
        _require(_params.minHealth_e18 <= IInitCore(CORE).getPosHealthCurrent_e18(initPosId), Errors.SLIPPAGE_CONTROL);
        // unwrap token if needed
        for (uint i; i < _params.withdrawParams.length; i = i.uinc()) {
            address helper = _params.withdrawParams[i].rebaseHelperParams.helper;
            if (helper != address(0)) IRebaseHelper(helper).unwrap(_params.withdrawParams[i].to);
        }
        // return native token
        if (_params.returnNative) {
            uint wNativeBal = IERC20(WNATIVE).balanceOf(address(this));
            // NOTE: no need receive function since we will use TransparentUpgradeableProxyReceiveETH
            if (wNativeBal != 0) IWNative(WNATIVE).withdraw(wNativeBal);
            uint nativeBal = address(this).balance;
            if (nativeBal != 0) {
                (bool success,) = payable(msg.sender).call{value: address(this).balance}('');
                _require(success, Errors.CALL_FAILED);
            }
        }
    }

    /// @inheritdoc IMoneyMarketHook
    function createPos(uint16 _mode, address _viewer) public returns (uint posId, uint initPosId) {
        posId = ++lastPosIds[msg.sender];
        initPosId = IInitCore(CORE).createPos(_mode, _viewer);
        initPosIds[msg.sender][posId] = initPosId;
    }

    /// @inheritdoc IMoneyMarketHook
    function setWhitelistedHelpers(address[] calldata _helpers, bool _status) external onlyGuardian {
        for (uint i; i < _helpers.length; i = i.uinc()) {
            whitelistedHelpers[_helpers[i]] = _status;
        }
        emit SetWhitelistedHelpers(_helpers, _status);
    }

    /// @dev approve token for init core if needed
    /// @param _token token address
    /// @param _amt token amount to spend
    function _ensureApprove(address _token, uint _amt) internal {
        if (IERC20(_token).allowance(address(this), CORE) < _amt) {
            IERC20(_token).safeApprove(CORE, type(uint).max);
        }
    }

    // @dev prepare and execute multicall
    // @param _initPosId init position id (nft id)
    // @param _params operation parameters
    // @return results results of multicall
    function _handleMulticall(uint _initPosId, OperationParams calldata _params)
        internal
        returns (bytes[] memory results)
    {
        // prepare data for multicall
        // 1. repay (if needed)
        // 2. withdraw (if needed)
        // 3. change position mode (if needed)
        // 4. borrow (if needed)
        // 5. deposit (if needed)
        bool changeMode = _params.mode != 0 && _params.mode != IPosManager(POS_MANAGER).getPosMode(_initPosId);
        bytes[] memory data;
        {
            uint dataLength = _params.repayParams.length + (2 * _params.withdrawParams.length) + (changeMode ? 1 : 0)
                + _params.borrowParams.length + (2 * _params.depositParams.length);
            data = new bytes[](dataLength);
        }
        uint offset;
        // 1. repay
        (offset, data) = _handleRepay(offset, data, _initPosId, _params.repayParams);
        // 2. withdraw
        (offset, data) = _handleWithdraw(offset, data, _initPosId, _params.withdrawParams, _params.returnNative);
        // 3. change position mode
        if (changeMode) {
            data[offset] = abi.encodeWithSelector(IInitCore.setPosMode.selector, _initPosId, _params.mode);
            offset = offset.uinc();
        }
        // 4. borrow
        (offset, data) = _handleBorrow(offset, data, _initPosId, _params.borrowParams, _params.returnNative);
        // 5. deposit
        (offset, data) = _handleDeposit(offset, data, _initPosId, _params.depositParams);
        // execute multicall
        results = IMulticall(CORE).multicall(data);
    }

    /// @dev generate repay data for multicall
    /// @param _offset offset of data
    /// @param _data multicall data
    /// @param _initPosId init position id (nft id)
    /// @param _params repay params
    /// @return offset new offset
    /// @return data new data
    function _handleRepay(uint _offset, bytes[] memory _data, uint _initPosId, RepayParams[] memory _params)
        internal
        returns (uint, bytes[] memory)
    {
        for (uint i; i < _params.length; i = i.uinc()) {
            address uToken = ILendingPool(_params[i].pool).underlyingToken();
            uint posDebtShares = IPosManager(POS_MANAGER).getPosDebtShares(_initPosId, _params[i].pool);
            uint repayShares = _params[i].shares <= posDebtShares ? _params[i].shares : posDebtShares;
            uint repayAmt = ILendingPool(_params[i].pool).debtShareToAmtCurrent(repayShares);
            _ensureApprove(uToken, repayAmt);
            if (uToken == WNATIVE) {
                if (msg.value != 0) IWNative(WNATIVE).deposit{value: msg.value}();
                repayAmt = repayAmt > msg.value ? repayAmt - msg.value : 0;
            }
            if (repayAmt != 0) IERC20(uToken).safeTransferFrom(msg.sender, address(this), repayAmt);
            _data[_offset] =
                abi.encodeWithSelector(IInitCore.repay.selector, _params[i].pool, _params[i].shares, _initPosId);
            _offset = _offset.uinc();
        }
        return (_offset, _data);
    }

    /// @dev generate withdraw data for multicall
    /// @param _offset offset of data
    /// @param _data multicall data
    /// @param _initPosId init position id (nft id)
    /// @param _params withdraw params
    /// @return offset new offset
    /// @return data new data
    function _handleWithdraw(
        uint _offset,
        bytes[] memory _data,
        uint _initPosId,
        WithdrawParams[] calldata _params,
        bool _returnNative
    ) internal view returns (uint, bytes[] memory) {
        for (uint i; i < _params.length; i = i.uinc()) {
            // decollateralize to pool
            _data[_offset] = abi.encodeWithSelector(
                IInitCore.decollateralize.selector, _initPosId, _params[i].pool, _params[i].shares, _params[i].pool
            );
            _offset = _offset.uinc();
            // burn collateral to underlying token
            address helper = _params[i].rebaseHelperParams.helper;
            address uToken = ILendingPool(_params[i].pool).underlyingToken();
            address uTokenReceiver = _params[i].to;
            if (uToken == WNATIVE && _returnNative) uTokenReceiver = address(this);
            // if need to unwrap to rebase token
            if (helper != address(0)) {
                // check if the helper is whitelisted
                _require(whitelistedHelpers[helper], Errors.NOT_WHITELISTED);
                _require(
                    _params[i].rebaseHelperParams.tokenIn == uToken
                        && IRebaseHelper(helper).YIELD_BEARING_TOKEN() == uToken,
                    Errors.INVALID_TOKEN_IN
                );
                uTokenReceiver = helper;
            }
            _data[_offset] = abi.encodeWithSelector(IInitCore.burnTo.selector, _params[i].pool, uTokenReceiver);
            _offset = _offset.uinc();
        }
        return (_offset, _data);
    }

    /// @dev generate borrow data for multicall
    /// @param _offset offset of data
    /// @param _data multicall data
    /// @param _initPosId init position id (nft id)
    /// @param _params borrow params
    /// @return offset new offset
    /// @return data new data
    function _handleBorrow(
        uint _offset,
        bytes[] memory _data,
        uint _initPosId,
        BorrowParams[] calldata _params,
        bool _returnNative
    ) internal view returns (uint, bytes[] memory) {
        for (uint i; i < _params.length; i = i.uinc()) {
            address uTokenReceiver = _params[i].to;
            address uToken = ILendingPool(_params[i].pool).underlyingToken();
            if (uToken == WNATIVE && _returnNative) uTokenReceiver = address(this);
            _data[_offset] = abi.encodeWithSelector(
                IInitCore.borrow.selector, _params[i].pool, _params[i].amt, _initPosId, uTokenReceiver
            );
            _offset = _offset.uinc();
        }
        return (_offset, _data);
    }

    /// @dev generate deposit data for multicall
    /// @param _offset offset of data
    /// @param _data multicall data
    /// @param _initPosId init position id (nft id)
    /// @param _params deposit params
    /// @return offset new offset
    /// @return data new data
    function _handleDeposit(uint _offset, bytes[] memory _data, uint _initPosId, DepositParams[] calldata _params)
        internal
        returns (uint, bytes[] memory)
    {
        for (uint i; i < _params.length; i = i.uinc()) {
            address pool = _params[i].pool;
            uint amt = _params[i].amt;
            address uToken = ILendingPool(pool).underlyingToken();
            address helper = _params[i].rebaseHelperParams.helper;
            // 1. deposit native token
            // NOTE: use msg.value for native token
            // amt > 0 mean user want to use wNative too
            if (uToken == WNATIVE) {
                if (msg.value != 0) {
                    IWNative(WNATIVE).deposit{value: msg.value}();
                    IERC20(WNATIVE).safeTransfer(pool, msg.value);
                }
                // transfer wNative to pool will user want to use wNative
                if (amt != 0) {
                    IERC20(WNATIVE).safeTransferFrom(msg.sender, pool, amt);
                }
            }
            // 2. wrap rebase token to non-rebase token and deposit
            else if (helper != address(0)) {
                address tokenIn = _params[i].rebaseHelperParams.tokenIn;
                // check if the helper is whitelisted
                _require(whitelistedHelpers[helper], Errors.NOT_WHITELISTED);
                _require(IRebaseHelper(helper).REBASE_TOKEN() == tokenIn, Errors.INVALID_TOKEN_IN);
                _require(IRebaseHelper(helper).YIELD_BEARING_TOKEN() == uToken, Errors.INVALID_TOKEN_OUT);
                IERC20(tokenIn).safeTransferFrom(msg.sender, helper, amt);
                IRebaseHelper(helper).wrap(pool);
            }
            // 3. deposit normal erc20 token
            else {
                IERC20(uToken).safeTransferFrom(msg.sender, pool, amt);
            }
            // mint to position
            _data[_offset] = abi.encodeWithSelector(IInitCore.mintTo.selector, pool, POS_MANAGER);
            _offset = _offset.uinc();
            // collateralize
            _data[_offset] = abi.encodeWithSelector(IInitCore.collateralize.selector, _initPosId, pool);
            _offset = _offset.uinc();
        }
        return (_offset, _data);
    }
}
