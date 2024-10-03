// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../common/library/InitErrors.sol';
import {Multicall} from '../common/Multicall.sol';
import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {IERC721} from '@openzeppelin-contracts/token/ERC721/IERC721.sol';
import {ERC721Holder} from '@openzeppelin-contracts/token/ERC721/utils/ERC721Holder.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';
import {IWNative} from '../interfaces/common/IWNative.sol';
import {IInitCore} from '../interfaces/core/IInitCore.sol';
import {IMulticall} from '../interfaces/common/IMulticall.sol';
import {ICallbackReceiver} from '../interfaces/receiver/ICallbackReceiver.sol';
import {ILendingPool} from '../interfaces/lending_pool/ILendingPool.sol';

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

contract MockMarginTradingHook is ICallbackReceiver, ERC721Holder, Multicall {
    using SafeERC20 for IERC20;

    address public immutable CORE;
    IWNative public immutable W_NATIVE;
    address public immutable ROUTER;
    mapping(uint => address) public owners;

    constructor(address _core, address _wNative, address _router) {
        CORE = _core;
        W_NATIVE = IWNative(_wNative);
        ROUTER = _router;
    }

    modifier onlyOwner(uint _posId) {
        _require(msg.sender == owners[_posId], Errors.NOT_OWNER);
        _;
    }

    function createPos(
        uint16 _mode,
        address _tokenIn,
        uint _amtIn,
        address _poolToBorrow,
        uint _amtToBorrow,
        address _poolToMint,
        uint _minHealth_e18
    ) external payable returns (uint posId) {
        posId = IInitCore(CORE).createPos(_mode, msg.sender);
        owners[posId] = msg.sender;
        if (_amtIn > 0) {
            IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), _amtIn);
        }
        bytes[] memory multicallData = new bytes[](4);
        multicallData[0] =
            abi.encodeWithSelector(IInitCore(CORE).borrow.selector, _poolToBorrow, _amtToBorrow, posId, address(this));
        multicallData[1] = abi.encodeWithSelector(
            IInitCore(CORE).callback.selector,
            address(this),
            msg.value,
            abi.encode(_tokenIn, _poolToBorrow, _poolToMint)
        );
        multicallData[2] =
            abi.encodeWithSelector(IInitCore(CORE).mintTo.selector, _poolToMint, IInitCore(CORE).POS_MANAGER());
        multicallData[3] = abi.encodeWithSelector(IInitCore(CORE).collateralize.selector, posId, _poolToMint);
        IMulticall(CORE).multicall{value: msg.value}(multicallData);
        _require(_minHealth_e18 <= IInitCore(CORE).getPosHealthCurrent_e18(posId), Errors.SLIPPAGE_CONTROL);
    }

    function repay(address _pool, uint _shares, uint _posId) external onlyOwner(_posId) {
        IERC20 underlyingToken = IERC20(ILendingPool(_pool).underlyingToken());
        uint amt = ILendingPool(_pool).debtShareToAmtCurrent(_shares);
        underlyingToken.safeTransferFrom(msg.sender, address(this), amt);
        _approve(address(underlyingToken), CORE, amt);
        IInitCore(CORE).repay(_pool, _shares, _posId);
    }

    function borrow(address _pool, uint _amt, uint _posId, address _to) external onlyOwner(_posId) {
        IInitCore(CORE).borrow(_pool, _amt, _posId, _to);
    }

    function depositAndCollateralize(address _pool, uint _posId, uint _amt) external onlyOwner(_posId) {
        IERC20 underlyingToken = IERC20(ILendingPool(_pool).underlyingToken());
        underlyingToken.safeTransferFrom(msg.sender, _pool, _amt);
        IInitCore(CORE).mintTo(_pool, IInitCore(CORE).POS_MANAGER());
        IInitCore(CORE).collateralize(_posId, _pool);
    }

    function decollateralize(address _pool, uint _posId, uint _shares) external onlyOwner(_posId) {
        IInitCore(CORE).decollateralize(_posId, _pool, _shares, msg.sender);
    }

    function withdrawCollateral(address _pool, uint _posId, uint _shares) external onlyOwner(_posId) {
        IInitCore(CORE).decollateralize(_posId, _pool, _shares, _pool);
        IInitCore(CORE).burnTo(_pool, msg.sender);
    }

    function changeMode(uint _posId, uint16 _mode) public onlyOwner(_posId) {
        IInitCore(CORE).setPosMode(_posId, _mode);
    }

    function withdrawPosition(uint _posId) external onlyOwner(_posId) {
        IERC721(IInitCore(CORE).POS_MANAGER()).safeTransferFrom(address(this), msg.sender, _posId);
        owners[_posId] = address(0);
    }

    function coreCallback(address, bytes calldata _data) external payable override returns (bytes memory result) {
        _require(msg.sender == CORE, Errors.NOT_INIT_CORE);
        if (msg.value > 0) {
            IWNative(W_NATIVE).deposit{value: msg.value}();
        }
        (address tokenIn, address poolToBorrow, address poolToMint) = abi.decode(_data, (address, address, address));
        address tokenToDeposit = ILendingPool(poolToMint).underlyingToken();
        address tokenBorrow = ILendingPool(poolToBorrow).underlyingToken();
        address[] memory path = new address[](2);
        // swap tokenIn to tokenToDeposit
        if (tokenIn != tokenBorrow) {
            uint tokenInAmt = IERC20(tokenIn).balanceOf(address(this));
            _approve(tokenIn, ROUTER, tokenInAmt);
            path[0] = tokenIn;
            path[1] = tokenToDeposit;
            IUniswapV2Router(ROUTER).swapExactTokensForTokens(tokenInAmt, 0, path, poolToMint, block.timestamp);
        }
        // swap tokenBorrow to tokenToDeposit
        uint tokenBorrowAmt = IERC20(tokenBorrow).balanceOf(address(this));
        _approve(tokenIn, ROUTER, tokenBorrowAmt);
        path[0] = tokenBorrow;
        path[1] = tokenToDeposit;
        uint[] memory amounts =
            IUniswapV2Router(ROUTER).swapExactTokensForTokens(tokenBorrowAmt, 0, path, poolToMint, block.timestamp);
        result = abi.encode(amounts);
    }

    function _approve(address _token, address _spender, uint _amt) internal {
        if (IERC20(_token).allowance(address(this), _spender) < _amt) {
            IERC20(_token).safeApprove(_spender, type(uint).max);
        }
    }
}
