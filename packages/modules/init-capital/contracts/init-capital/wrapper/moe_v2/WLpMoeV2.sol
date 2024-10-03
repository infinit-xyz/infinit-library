// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../../common/library/InitErrors.sol';
import '../../common/library/UncheckedIncrement.sol';
import {UnderACM} from '../../common/UnderACM.sol';

import {IInitOracle} from '../../interfaces/oracle/IInitOracle.sol';
import {IWNative} from '../../interfaces/common/IWNative.sol';
import {ILBToken} from '../../interfaces/common/moe_v2/ILBToken.sol';
import {ILBPair} from '../../interfaces/common/moe_v2/ILBPair.sol';
import {IBaseWrapLpUpgradeable} from '../../interfaces/wrapper/IBaseWrapLpUpgradeable.sol';
import {IWrapLpERC1155Upgradeable} from '../../interfaces/wrapper/IWrapLpERC1155Upgradeable.sol';
import {IWLpMoeV2} from '../../interfaces/wrapper/moe_v2/IWLpMoeV2.sol';
import {ILBTokenHolder} from '../../interfaces/wrapper/moe_v2/ILBTokenHolder.sol';
import {ILBFactory} from '../../interfaces/common/moe_v2/ILBFactory.sol';

import {ERC721} from '@openzeppelin-contracts/token/ERC721/ERC721.sol';
import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';
import {Math} from '@openzeppelin-contracts/utils/math/Math.sol';
import {ERC721Upgradeable} from '@openzeppelin-contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import {BeaconProxy} from '@openzeppelin-contracts/proxy/beacon/BeaconProxy.sol';

import {LBTokenHolder} from './LBTokenHolder.sol';

contract WLpMoeV2 is IWLpMoeV2, IWrapLpERC1155Upgradeable, ERC721Upgradeable, UnderACM {
    using Math for uint;
    using UncheckedIncrement for uint;
    using SafeERC20 for IERC20;

    // constants
    uint private constant ONE_X128 = 2 ** 128;
    bytes32 private constant GUARDIAN = keccak256('guardian');

    // immutables
    address public immutable LB_FACTORY;
    address public immutable LB_HOLDER_BEACON;

    // storages
    // last wLp id
    uint public lastId;
    /// @inheritdoc IWLpMoeV2
    uint public limitBinLength;
    /// @inheritdoc IWLpMoeV2
    uint public maxLiquidityPerShare_x128;
    /// @inheritdoc IWLpMoeV2
    mapping(address => mapping(uint24 => uint)) public binMaxLiquidityPerShares_x128;

    /// @inheritdoc IWLpMoeV2
    mapping(address => bool) public wlMoeRewarders;

    // wLp id => lp position
    mapping(uint => LBPosition) private __lbPositions;

    // modifiers
    modifier onlyOwner(uint _id) {
        _require(msg.sender == _ownerOf(_id), Errors.NOT_OWNER);
        _;
    }

    modifier onlyGuardian() {
        ACM.checkRole(GUARDIAN, msg.sender);
        _;
    }

    modifier checkArrayLength(uint lengthA, uint lengthB) {
        // validate matching array length
        _require(lengthA == lengthB, Errors.ARRAY_LENGTH_MISMATCHED);
        _;
    }

    // constructor
    constructor(address _acm, address _lbFactory, address _lbHolderBeacon) UnderACM(_acm) {
        _disableInitializers();
        LB_FACTORY = _lbFactory;
        LB_HOLDER_BEACON = _lbHolderBeacon;
    }

    // initializer
    /// @dev initialize the contract, set the ERC721's name and symbol
    /// @param _name ERC721's name
    /// @param _symbol ERC721's symbol
    function initialize(string calldata _name, string calldata _symbol, uint _limitBinLength) external initializer {
        __ERC721_init(_name, _symbol);
        limitBinLength = _limitBinLength;
    }

    function getPosInfo(uint _id) external view returns (LBPosition memory pos) {
        pos = __lbPositions[_id];
    }

    // functions
    /// @inheritdoc IWrapLpERC1155Upgradeable
    function wrap(address _lp, uint[] calldata _ids, uint[] calldata _amts, address _to, bytes calldata _extraData)
        external
        checkArrayLength(_ids.length, _amts.length)
        returns (uint id)
    {
        // validate bin length limit
        _require(_ids.length <= limitBinLength, Errors.LIMIT_LENGTH_EXCEED);

        // validate LBToken
        {
            IERC20 tokenX = ILBPair(_lp).getTokenX();
            IERC20 tokenY = ILBPair(_lp).getTokenY();
            uint16 binStep = ILBPair(_lp).getBinStep();
            ILBFactory.LBPairInformation memory pairInfo =
                ILBFactory(LB_FACTORY).getLBPairInformation(tokenX, tokenY, binStep);
            _require(address(pairInfo.LBPair) == _lp, Errors.INCORRECT_PAIR);
        }

        // decode claimer
        address claimer = abi.decode(_extraData, (address));

        // records
        id = ++lastId;

        // create a position holder with a claimer
        ILBTokenHolder lbHolder = ILBTokenHolder(
            address(
                new BeaconProxy(
                    LB_HOLDER_BEACON,
                    abi.encodeWithSelector(LBTokenHolder.initialize.selector, address(this), _lp, claimer)
                )
            )
        );

        __lbPositions[id] =
            LBPosition({lbToken: _lp, balance: 1e18, lbHolder: lbHolder, binIds: _ids, binIdShares_x128: _amts});

        // transfer all lp ids to lbHolder
        ILBToken(_lp).batchTransferFrom(msg.sender, address(lbHolder), _ids, _amts);

        // mint
        _mint(_to, id);
    }

    /// @inheritdoc IBaseWrapLpUpgradeable
    /// @return amtOut amount of lp token out
    function unwrap(uint _id, uint _amt, address _to) external onlyOwner(_id) returns (bytes memory amtOut) {
        LBPosition storage pos = __lbPositions[_id];

        // update records
        uint posBalanceBefore = pos.balance;
        pos.balance = posBalanceBefore - _amt;

        uint[] memory posBinIds = pos.binIds;
        uint[] memory posBinIdShares_x128 = pos.binIdShares_x128;
        uint[] memory transferOutShares_x128 = new uint[](posBinIds.length);
        for (uint i; i < posBinIds.length; i = i.uinc()) {
            // load current binId's share
            uint binIdShare_x128 = posBinIdShares_x128[i];
            // record each bin's transfer out share from the percentage of the position's balance
            transferOutShares_x128[i] = binIdShare_x128 * _amt / posBalanceBefore;
            binIdShare_x128 -= transferOutShares_x128[i];
            posBinIdShares_x128[i] = binIdShare_x128;
        }
        // update position's bin share
        pos.binIdShares_x128 = posBinIdShares_x128;

        // transfer LBToken bin shares
        pos.lbHolder.batchTransferLBTokenTo(_to, posBinIds, transferOutShares_x128);
        amtOut = abi.encode(posBinIds, transferOutShares_x128);
    }

    /// @notice do nothing here, the function is not compatable with off-chain reward
    /// @inheritdoc IBaseWrapLpUpgradeable
    function rewardTokens(uint _id) external view returns (address[] memory tokens) {}

    /// @notice do nothing here, the function is not compatible with off-chain reward
    /// The user should claim reward directly from LBTokenHolder
    /// @inheritdoc IBaseWrapLpUpgradeable
    function harvest(uint _id, address _to)
        external
        onlyOwner(_id)
        returns (address[] memory tokens, uint[] memory amts)
    {}

    /// @inheritdoc IBaseWrapLpUpgradeable
    function lp(uint _id) external view returns (address) {
        return __lbPositions[_id].lbToken;
    }

    /// @inheritdoc IBaseWrapLpUpgradeable
    function balanceOfLp(uint _id) external view returns (uint) {
        return __lbPositions[_id].balance;
    }

    /// @inheritdoc IBaseWrapLpUpgradeable
    function underlyingTokens(uint _id) public view returns (address[] memory tokens) {
        address lbToken = __lbPositions[_id].lbToken;
        tokens = new address[](2);
        tokens[0] = address(ILBPair(lbToken).getTokenX());
        tokens[1] = address(ILBPair(lbToken).getTokenY());
    }

    /// @inheritdoc IWLpMoeV2
    function posLbHolder(uint _id) public view returns (ILBTokenHolder lbHolder) {
        lbHolder = __lbPositions[_id].lbHolder;
    }

    /// @inheritdoc IWLpMoeV2
    function getPosBinIdsAndShares(uint _id)
        external
        view
        returns (uint[] memory binIds, uint[] memory binIdShares_x128)
    {
        LBPosition memory pos = __lbPositions[_id];
        binIds = pos.binIds;
        binIdShares_x128 = pos.binIdShares_x128;
    }

    /// @inheritdoc IBaseWrapLpUpgradeable
    function calculatePrice_e36(uint _id, address _oracle) external view returns (uint price_e36) {
        LBPosition storage pos = __lbPositions[_id];
        uint[] memory underlyingTokensPrices_e36 = IInitOracle(_oracle).getPrices_e36(underlyingTokens(_id));

        // loop though position bins
        uint posValue_e36;
        uint posBinIdsLength = pos.binIds.length;
        for (uint i; i < posBinIdsLength; i = i.uinc()) {
            uint pricePerShare_e36 = _getBinFairPricePerShare_e36(
                pos.lbToken, uint24(pos.binIds[i]), underlyingTokensPrices_e36[0], underlyingTokensPrices_e36[1]
            );
            posValue_e36 += pos.binIdShares_x128[i].mulDiv(pricePerShare_e36, ONE_X128);
        }

        price_e36 = posValue_e36 / pos.balance;
    }

    /// @inheritdoc IWLpMoeV2
    function setWhitelistedMoeRewarders(address[] calldata _moeRewarders, bool _status) external onlyGuardian {
        for (uint i; i < _moeRewarders.length; i = i.uinc()) {
            wlMoeRewarders[_moeRewarders[i]] = _status;
        }
        emit SetWhitelistedMoeRewarders(_moeRewarders, _status);
    }

    /// @inheritdoc IWLpMoeV2
    function setMaxLiquidityPerShares_x128(uint _maxLiquidityPerShare_x128) external onlyGuardian {
        maxLiquidityPerShare_x128 = _maxLiquidityPerShare_x128;
        emit SetMaxLiquidityPerShare_x128(maxLiquidityPerShare_x128);
    }

    /// @inheritdoc IWLpMoeV2
    function setBinMaxLiquidityPerShares_x128(
        address _lbToken,
        uint24[] calldata _binIds,
        uint[] calldata _binMaxLiquidityPerShares_x128
    ) external checkArrayLength(_binIds.length, _binMaxLiquidityPerShares_x128.length) onlyGuardian {
        for (uint i; i < _binIds.length; i = i.uinc()) {
            binMaxLiquidityPerShares_x128[_lbToken][_binIds[i]] = _binMaxLiquidityPerShares_x128[i];
        }
        emit SetBinMaxLiquidityPerShares_x128(_lbToken, _binIds, _binMaxLiquidityPerShares_x128);
    }

    /// @inheritdoc IWLpMoeV2
    function setLimitBinLength(uint _binLength) external onlyGuardian {
        limitBinLength = _binLength;
        emit SetLimitBinLength(limitBinLength);
    }

    /// @dev get bin fair price per share in E36
    /// @param _lbToken LBToken address
    /// @param _binId bin id of LBToken
    /// @param _p0_e36 token0 price in E36
    /// @param _p1_e36 token1 price in E36
    /// @return binPricePerShare_e36 fair price per share
    function _getBinFairPricePerShare_e36(address _lbToken, uint24 _binId, uint _p0_e36, uint _p1_e36)
        internal
        view
        returns (uint binPricePerShare_e36)
    {
        uint binTotalSupply_x128 = ILBToken(_lbToken).totalSupply(_binId);
        // no price when there are no liquidity
        if (binTotalSupply_x128 == 0) return 0;
        uint24 fairActiveId = _getBinFairActiveId(_lbToken, _p0_e36, _p1_e36);
        (uint128 binReserveX, uint128 binReserveY) = ILBToken(_lbToken).getBin(_binId);
        uint binPrice_x128 = ILBToken(_lbToken).getPriceFromId(_binId); // P
        uint binLiquidity_x128 = _getBinLiquitdity_x128(binReserveX, binReserveY, binPrice_x128); // L
        uint binMaxLiquidityPerShare_x128 = binMaxLiquidityPerShares_x128[_lbToken][_binId];
        uint _maxLiquidityPerShare_x128 =
            binMaxLiquidityPerShare_x128 != 0 ? binMaxLiquidityPerShare_x128 : maxLiquidityPerShare_x128;
        if (_binId <= fairActiveId) {
            // bin's price per share = min(p1 * L/TS, p1 * maxLiquidityPerShare )
            binPricePerShare_e36 = Math.min(
                _p1_e36.mulDiv(binLiquidity_x128, binTotalSupply_x128),
                _p1_e36.mulDiv(_maxLiquidityPerShare_x128, ONE_X128)
            );
        } else {
            // bin's price per share = min(p0 * (scale * L /TS) / P, p0 * maxLiquidityPerShare / P )
            binPricePerShare_e36 = Math.min(
                _p0_e36.mulDiv(ONE_X128.mulDiv(binLiquidity_x128, binTotalSupply_x128), binPrice_x128),
                _p0_e36.mulDiv(_maxLiquidityPerShare_x128, binPrice_x128)
            );
        }
    }

    /// @dev get bin fair active id for current fair price
    /// @param _lbToken LBToken address
    /// @param _p0_e36 token0 price in E36
    /// @param _p1_e36 token1 price in E36
    /// @return binFairActiveId bin's active id for the given price
    function _getBinFairActiveId(address _lbToken, uint _p0_e36, uint _p1_e36)
        internal
        view
        returns (uint24 binFairActiveId)
    {
        // P = p0 / p1 with price_e36 to 128x128
        uint fairPrice_x128 = _p0_e36.mulDiv(ONE_X128, _p1_e36);
        // get fairBinId from price
        binFairActiveId = ILBToken(_lbToken).getIdFromPrice(fairPrice_x128);
    }

    /// @dev get bin's liquidity from price and token amounts
    /// @param _amtX bin's tokenX amounts
    /// @param _amtY bin's tokenY amounts
    /// @param _price_x128 bin's spot price in 128.128
    /// @return binLiquidity_x128 bin's liquidity in 128.128
    function _getBinLiquitdity_x128(uint _amtX, uint _amtY, uint _price_x128)
        internal
        pure
        returns (uint binLiquidity_x128)
    {
        // derive from L = Px + y
        // L = Px
        if (_amtX > 0) {
            binLiquidity_x128 = _price_x128 * _amtX;
        }
        // L = y
        if (_amtY > 0) {
            // transform to 128.128
            binLiquidity_x128 += _amtY << 128;
        }
    }
}
