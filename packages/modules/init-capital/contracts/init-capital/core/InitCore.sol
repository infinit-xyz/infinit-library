// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {Multicall} from '../common/Multicall.sol';
import '../common/library/InitErrors.sol';
import '../common/library/ArrayLib.sol';
import {UnderACM} from '../common/UnderACM.sol';

import {IInitCore} from '../interfaces/core/IInitCore.sol';
import {IPosManager} from '../interfaces/core/IPosManager.sol';
import {PoolConfig, TokenFactors, ModeStatus, IConfig} from '../interfaces/core/IConfig.sol';
import {ILendingPool} from '../interfaces/lending_pool/ILendingPool.sol';
import {IBaseWrapLp} from '../interfaces/wrapper/IBaseWrapLp.sol';
import {IInitOracle} from '../interfaces/oracle/IInitOracle.sol';
import {ILiqIncentiveCalculator} from '../interfaces/core/ILiqIncentiveCalculator.sol';
import {ICallbackReceiver} from '../interfaces/receiver/ICallbackReceiver.sol';
import {IFlashReceiver} from '../interfaces/receiver/IFlashReceiver.sol';
import {IRiskManager} from '../interfaces/risk_manager/IRiskManager.sol';

import {ReentrancyGuardUpgradeable} from '@openzeppelin-contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import {SafeCast} from '@openzeppelin-contracts/utils/math/SafeCast.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';
import {MathUpgradeable} from '@openzeppelin-contracts-upgradeable/utils/math/MathUpgradeable.sol';
import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {EnumerableSet} from '@openzeppelin-contracts/utils/structs/EnumerableSet.sol';

contract InitCore is IInitCore, Multicall, ReentrancyGuardUpgradeable, UnderACM {
    using SafeCast for uint;
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.UintSet;
    using MathUpgradeable for uint;
    using UncheckedIncrement for uint;

    // constants
    uint private constant ONE_E18 = 1e18;
    bytes32 private constant GUARDIAN = keccak256('guardian');
    bytes32 private constant GOVERNOR = keccak256('governor');

    // immutables
    address public immutable POS_MANAGER;

    // storages
    address public config; // @inheritdoc IInitCore
    address public oracle; // @inheritdoc IInitCore
    address public liqIncentiveCalculator; // @inheritdoc IInitCore
    address public riskManager; // @inheritdoc IInitCore
    bool internal isMulticallTx;
    EnumerableSet.UintSet internal uncheckedPosIds; // posIds that need to be checked after multicall

    // modifiers
    modifier onlyGuardian() {
        ACM.checkRole(GUARDIAN, msg.sender);
        _;
    }

    modifier onlyGovernor() {
        ACM.checkRole(GOVERNOR, msg.sender);
        _;
    }

    modifier onlyAuthorized(uint _posId) {
        _require(IPosManager(POS_MANAGER).isAuthorized(msg.sender, _posId), Errors.NOT_AUTHORIZED);
        _;
    }

    /// @dev keep track of the position and ensure that the position is healthy at the very end
    /// @param _posId pos id to ensure health
    modifier ensurePositionHealth(uint _posId) {
        if (isMulticallTx) uncheckedPosIds.add(_posId);
        _;
        if (!isMulticallTx) _require(_isPosHealthy(_posId), Errors.POSITION_NOT_HEALTHY);
    }

    // constructor
    constructor(address _posManager, address _acm) UnderACM(_acm) {
        POS_MANAGER = _posManager;
        _disableInitializers();
    }

    // initalize
    /// @dev initialize contract and setup config, oracle, incentive calculator and risk manager addresses
    /// @param _config config address
    /// @param _oracle oracle address
    /// @param _liqIncentiveCalculator liquidation incentive calculator address
    /// @param _riskManager risk manager address
    function initialize(address _config, address _oracle, address _liqIncentiveCalculator, address _riskManager)
        external
        initializer
    {
        __ReentrancyGuard_init();
        _setConfig(_config);
        _setOracle(_oracle);
        _setLiqIncentiveCalculator(_liqIncentiveCalculator);
        _setRiskManager(_riskManager);
    }

    // functions
    /// @inheritdoc IInitCore
    function mintTo(address _pool, address _to) public virtual nonReentrant returns (uint shares) {
        // check pool status
        PoolConfig memory poolConfig = IConfig(config).getPoolConfig(_pool);
        _require(poolConfig.canMint, Errors.MINT_PAUSED);
        // call mint at pool using _to
        shares = ILendingPool(_pool).mint(_to);
        // check supply cap after mint
        _require(ILendingPool(_pool).totalAssets() <= poolConfig.supplyCap, Errors.SUPPLY_CAP_REACHED);
    }

    /// @inheritdoc IInitCore
    function burnTo(address _pool, address _to) public virtual nonReentrant returns (uint amt) {
        // check pool status
        PoolConfig memory poolConfig = IConfig(config).getPoolConfig(_pool);
        _require(poolConfig.canBurn, Errors.REDEEM_PAUSED);
        // call burn at pool using _to
        amt = ILendingPool(_pool).burn(_to);
    }

    /// @inheritdoc IInitCore
    function borrow(address _pool, uint _amt, uint _posId, address _to)
        public
        virtual
        onlyAuthorized(_posId)
        ensurePositionHealth(_posId)
        nonReentrant
        returns (uint shares)
    {
        IConfig _config = IConfig(config);
        // check pool and mode status
        PoolConfig memory poolConfig = _config.getPoolConfig(_pool);
        uint16 mode = _getPosMode(_posId);
        // check if the mode is allow to borrow
        _require(poolConfig.canBorrow && _config.getModeStatus(mode).canBorrow, Errors.BORROW_PAUSED);
        // check if the position mode supports _pool
        _require(_config.isAllowedForBorrow(mode, _pool), Errors.INVALID_MODE);
        // get borrow shares (accrue interest)
        shares = ILendingPool(_pool).debtAmtToShareCurrent(_amt);
        // check shares != 0
        _require(shares != 0, Errors.ZERO_VALUE);
        // check borrow cap after borrow
        _require(ILendingPool(_pool).totalDebt() + _amt <= poolConfig.borrowCap, Errors.BORROW_CAP_REACHED);
        // update debt on the position
        IPosManager(POS_MANAGER).updatePosDebtShares(_posId, _pool, shares.toInt256());
        // call borrow from the pool with target _to
        ILendingPool(_pool).borrow(_to, _amt);
        // update debt on mode
        IRiskManager(riskManager).updateModeDebtShares(mode, _pool, shares.toInt256());
        emit Borrow(_pool, _posId, _to, _amt, shares);
    }

    /// @inheritdoc IInitCore
    function repay(address _pool, uint _shares, uint _posId)
        public
        virtual
        onlyAuthorized(_posId)
        nonReentrant
        returns (uint amt)
    {
        (, amt) = _repay(IConfig(config), _getPosMode(_posId), _posId, _pool, _shares);
    }

    /// @inheritdoc IInitCore
    function createPos(uint16 _mode, address _viewer) public virtual nonReentrant returns (uint posId) {
        posId = IPosManager(POS_MANAGER).createPos(msg.sender, _mode, _viewer);
        emit CreatePosition(msg.sender, posId, _mode, _viewer);
    }

    /// @inheritdoc IInitCore
    function setPosMode(uint _posId, uint16 _mode)
        public
        virtual
        onlyAuthorized(_posId)
        ensurePositionHealth(_posId)
        nonReentrant
    {
        IConfig _config = IConfig(config);
        // get current collaterals in the position
        (address[] memory pools,, address[] memory wLps, uint[][] memory ids,) =
            IPosManager(POS_MANAGER).getPosCollInfo(_posId);

        uint16 currentMode = _getPosMode(_posId);
        ModeStatus memory currentModeStatus = _config.getModeStatus(currentMode);
        ModeStatus memory newModeStatus = _config.getModeStatus(_mode);
        if (pools.length != 0 || wLps.length != 0) {
            _require(newModeStatus.canCollateralize, Errors.COLLATERALIZE_PAUSED);
            _require(currentModeStatus.canDecollateralize, Errors.DECOLLATERALIZE_PAUSED);
        }
        // check that each position collateral belongs to the _mode
        for (uint i; i < pools.length; i = i.uinc()) {
            _require(_config.isAllowedForCollateral(_mode, pools[i]), Errors.INVALID_MODE);
        }
        for (uint i; i < wLps.length; i = i.uinc()) {
            // check if the wLp is whitelisted
            _require(_config.whitelistedWLps(wLps[i]), Errors.TOKEN_NOT_WHITELISTED);
            for (uint j; j < ids[i].length; j = j.uinc()) {
                _require(_config.isAllowedForCollateral(_mode, IBaseWrapLp(wLps[i]).lp(ids[i][j])), Errors.INVALID_MODE);
            }
        }
        // validate max wLp count
        _validateModeMaxWLpCount(_config, _mode, _posId);
        // get current debts in the position
        uint[] memory shares;
        (pools, shares) = IPosManager(POS_MANAGER).getPosBorrInfo(_posId);
        IRiskManager _riskManager = IRiskManager(riskManager);
        _require(newModeStatus.canBorrow, Errors.BORROW_PAUSED);
        _require(currentModeStatus.canRepay && newModeStatus.canRepay, Errors.REPAY_PAUSED);
        // check that each position debt belongs to the _mode
        for (uint i; i < pools.length; i = i.uinc()) {
            _require(_config.isAllowedForBorrow(_mode, pools[i]), Errors.INVALID_MODE);
            // update debt on current mode
            _riskManager.updateModeDebtShares(currentMode, pools[i], -shares[i].toInt256());
            // update debt on new mode
            _riskManager.updateModeDebtShares(_mode, pools[i], shares[i].toInt256());
        }
        // update position mode
        IPosManager(POS_MANAGER).updatePosMode(_posId, _mode);
        emit SetPositionMode(_posId, _mode);
    }

    /// @inheritdoc IInitCore
    function collateralize(uint _posId, address _pool) public virtual onlyAuthorized(_posId) nonReentrant {
        IConfig _config = IConfig(config);
        // check mode status
        uint16 mode = _getPosMode(_posId);
        _require(_config.getModeStatus(mode).canCollateralize, Errors.COLLATERALIZE_PAUSED);
        // check if the position mode supports _pool
        _require(_config.isAllowedForCollateral(mode, _pool), Errors.INVALID_MODE);
        // update collateral on the position
        uint amtColl = IPosManager(POS_MANAGER).addCollateral(_posId, _pool);
        emit Collateralize(_posId, _pool, amtColl);
    }

    /// @inheritdoc IInitCore
    function decollateralize(uint _posId, address _pool, uint _shares, address _to)
        public
        virtual
        onlyAuthorized(_posId)
        ensurePositionHealth(_posId)
        nonReentrant
    {
        // check mode status
        _require(IConfig(config).getModeStatus(_getPosMode(_posId)).canDecollateralize, Errors.DECOLLATERALIZE_PAUSED);
        // take _pool from position to _to
        uint amtDecoll = IPosManager(POS_MANAGER).removeCollateralTo(_posId, _pool, _shares, _to);
        emit Decollateralize(_posId, _pool, _to, amtDecoll);
    }

    /// @inheritdoc IInitCore
    function collateralizeWLp(uint _posId, address _wLp, uint _tokenId)
        public
        virtual
        onlyAuthorized(_posId)
        nonReentrant
    {
        IConfig _config = IConfig(config);
        uint16 mode = _getPosMode(_posId);
        // check mode status
        _require(_config.getModeStatus(mode).canCollateralize, Errors.COLLATERALIZE_PAUSED);
        // check if the wLp is whitelisted
        _require(_config.whitelistedWLps(_wLp), Errors.TOKEN_NOT_WHITELISTED);
        // check if the position mode supports _wLp
        _require(_config.isAllowedForCollateral(mode, IBaseWrapLp(_wLp).lp(_tokenId)), Errors.INVALID_MODE);
        // update collateral on the position
        uint amtColl = IPosManager(POS_MANAGER).addCollateralWLp(_posId, _wLp, _tokenId);
        // validate max wLp count
        _validateModeMaxWLpCount(_config, mode, _posId);
        emit CollateralizeWLp(_posId, _wLp, _tokenId, amtColl);
    }

    /// @inheritdoc IInitCore
    function decollateralizeWLp(uint _posId, address _wLp, uint _tokenId, uint _amt, address _to)
        public
        virtual
        onlyAuthorized(_posId)
        ensurePositionHealth(_posId)
        nonReentrant
    {
        IConfig _config = IConfig(config);
        // check mode status
        _require(_config.getModeStatus(_getPosMode(_posId)).canDecollateralize, Errors.DECOLLATERALIZE_PAUSED);
        // check wLp is whitelisted
        _require(_config.whitelistedWLps(_wLp), Errors.TOKEN_NOT_WHITELISTED);
        // update and take _wLp from position to _to
        uint amtDecoll = IPosManager(POS_MANAGER).removeCollateralWLpTo(_posId, _wLp, _tokenId, _amt, _to);
        emit DecollateralizeWLp(_posId, _wLp, _tokenId, _to, amtDecoll);
    }

    /// @inheritdoc IInitCore
    function liquidate(uint _posId, address _poolToRepay, uint _repayShares, address _poolOut, uint _minShares)
        public
        virtual
        nonReentrant
        returns (uint shares)
    {
        LiquidateLocalVars memory vars = _liquidateInternal(_posId, _poolToRepay, _repayShares);

        _require(vars.config.isAllowedForCollateral(vars.mode, _poolOut), Errors.TOKEN_NOT_WHITELISTED); // config and mode are already stored

        vars.collToken = ILendingPool(_poolOut).underlyingToken();
        vars.liqIncentive_e18 = ILiqIncentiveCalculator(liqIncentiveCalculator).getLiqIncentiveMultiplier_e18(
            vars.mode, vars.health_e18, vars.repayToken, vars.collToken
        );
        vars.repayAmtWithLiqIncentive = (vars.repayAmt * vars.liqIncentive_e18) / ONE_E18;
        {
            uint[] memory prices_e36; // prices = [repayTokenPrice, collToken]
            address[] memory tokens = new address[](2);
            (tokens[0], tokens[1]) = (vars.repayToken, vars.collToken);
            prices_e36 = IInitOracle(oracle).getPrices_e36(tokens);
            // calculate _tokenOut amt to return to liquidator
            shares = ILendingPool(_poolOut).toShares((vars.repayAmtWithLiqIncentive * prices_e36[0]) / prices_e36[1]);
            // take min of what's available (for bad debt repayment)
            shares = shares.min(IPosManager(POS_MANAGER).getCollAmt(_posId, _poolOut)); // take min of what's available
            _require(shares >= _minShares, Errors.SLIPPAGE_CONTROL);
        }
        // take _tokenOut from position to msg.sender
        if (shares > 0) IPosManager(POS_MANAGER).removeCollateralTo(_posId, _poolOut, shares, msg.sender);
        // check that position's health <= maxHealth
        // NOTE: bypass this for underwater position
        if (vars.health_e18 != 0) _ensurePosHealthAfterLiq(vars.config, _posId, vars.mode);
        emit Liquidate(_posId, msg.sender, _poolOut, shares);
    }

    /// @inheritdoc IInitCore
    function liquidateWLp(
        uint _posId,
        address _poolToRepay,
        uint _repayShares,
        address _wLp,
        uint _tokenId,
        uint _minlpOut
    ) external virtual nonReentrant returns (uint lpAmtOut) {
        LiquidateLocalVars memory vars = _liquidateInternal(_posId, _poolToRepay, _repayShares);

        _require(vars.config.whitelistedWLps(_wLp), Errors.TOKEN_NOT_WHITELISTED); // config is already stored

        vars.collToken = IBaseWrapLp(_wLp).lp(_tokenId);

        vars.liqIncentive_e18 = ILiqIncentiveCalculator(liqIncentiveCalculator).getLiqIncentiveMultiplier_e18(
            vars.mode, vars.health_e18, vars.repayToken, vars.collToken
        );
        vars.repayAmtWithLiqIncentive = (vars.repayAmt * vars.liqIncentive_e18) / ONE_E18;

        uint wLpAmtToBurn;
        {
            address _oracle = oracle;
            uint wLpAmt = IPosManager(POS_MANAGER).getCollWLpAmt(_posId, _wLp, _tokenId);
            wLpAmtToBurn = IInitOracle(_oracle).getPrice_e36(vars.repayToken).mulDiv(
                vars.repayAmtWithLiqIncentive, IBaseWrapLp(_wLp).calculatePrice_e36(_tokenId, _oracle)
            );
            // take min of what's available (for bad debt repayment)
            wLpAmtToBurn = wLpAmtToBurn.min(wLpAmt);
        }
        // reduce and burn wLp to underlying for liquidator
        if (wLpAmtToBurn > 0) {
            lpAmtOut = IPosManager(POS_MANAGER).removeCollateralWLpTo(_posId, _wLp, _tokenId, wLpAmtToBurn, msg.sender);
        }
        _require(lpAmtOut >= _minlpOut, Errors.SLIPPAGE_CONTROL);
        // check that position's health <= maxHealth
        // NOTE: bypass this for underwater position
        if (vars.health_e18 != 0) _ensurePosHealthAfterLiq(vars.config, _posId, vars.mode);
        emit LiquidateWLp(_posId, msg.sender, _wLp, _tokenId, wLpAmtToBurn);
    }

    /// @inheritdoc IInitCore
    function flash(address[] calldata _pools, uint[] calldata _amts, bytes calldata _data)
        public
        virtual
        nonReentrant
    {
        // validate that _pools is sorted and not duplicate
        _require(AddressArrayLib.isSortedAndNotDuplicate(_pools), Errors.INVALID_FLASHLOAN);
        // check that is not multicall tx
        _require(!isMulticallTx, Errors.LOCKED_MULTICALL);
        uint[] memory balanceBefores = new uint[](_pools.length);
        address[] memory tokens = new address[](_pools.length);
        IConfig _config = IConfig(config);
        for (uint i; i < _pools.length; i = i.uinc()) {
            PoolConfig memory poolConfig = _config.getPoolConfig(_pools[i]);
            // check that flash is enabled
            _require(poolConfig.canFlash, Errors.FLASH_PAUSED);
            address token = ILendingPool(_pools[i]).underlyingToken();
            tokens[i] = token;
            // calculate return amt
            balanceBefores[i] = IERC20(token).balanceOf(_pools[i]);
            // take _amts[i] of _pools[i] to msg.sender
            IERC20(token).safeTransferFrom(_pools[i], msg.sender, _amts[i]);
        }
        // execute callback
        IFlashReceiver(msg.sender).flashCallback(_pools, _amts, _data);
        // check pool balance after callback
        for (uint i; i < _pools.length; i = i.uinc()) {
            _require(IERC20(tokens[i]).balanceOf(_pools[i]) >= balanceBefores[i], Errors.INVALID_AMOUNT_TO_REPAY);
        }
    }

    /// @dev multicall function with health check after all call
    function multicall(bytes[] calldata data) public payable virtual override returns (bytes[] memory results) {
        _require(!isMulticallTx, Errors.LOCKED_MULTICALL);
        isMulticallTx = true;
        // multicall
        results = super.multicall(data);
        // === loop uncheckedPosIds ===
        uint[] memory posIds = uncheckedPosIds.values();
        for (uint i; i < posIds.length; i = i.uinc()) {
            // check position health
            _require(_isPosHealthy(posIds[i]), Errors.POSITION_NOT_HEALTHY);
            uncheckedPosIds.remove(posIds[i]);
        }
        // clear uncheckedPosIds
        isMulticallTx = false;
    }

    /// @inheritdoc IInitCore
    function setConfig(address _config) external onlyGovernor {
        _setConfig(_config);
    }

    /// @inheritdoc IInitCore
    function setOracle(address _oracle) external onlyGovernor {
        _setOracle(_oracle);
    }

    /// @inheritdoc IInitCore
    function setLiqIncentiveCalculator(address _liqIncentiveCalculator) external onlyGuardian {
        _setLiqIncentiveCalculator(_liqIncentiveCalculator);
    }

    /// @inheritdoc IInitCore
    function setRiskManager(address _riskManager) external onlyGuardian {
        _setRiskManager(_riskManager);
    }

    /// @dev set config
    function _setConfig(address _config) internal {
        config = _config;
        emit SetConfig(_config);
    }

    /// @dev set oracle
    function _setOracle(address _oracle) internal {
        oracle = _oracle;
        emit SetOracle(_oracle);
    }

    /// @dev set liquidation incentive calculator
    function _setLiqIncentiveCalculator(address _liqIncentiveCalculator) internal {
        liqIncentiveCalculator = _liqIncentiveCalculator;
        emit SetIncentiveCalculator(_liqIncentiveCalculator);
    }

    /// @dev set risk manager
    function _setRiskManager(address _riskManager) internal {
        riskManager = _riskManager;
        emit SetRiskManager(_riskManager);
    }

    /// @inheritdoc IInitCore
    function getCollateralCreditCurrent_e36(uint _posId) public virtual returns (uint collCredit_e36) {
        address _oracle = oracle;
        IConfig _config = IConfig(config);
        uint16 mode = _getPosMode(_posId);
        // get position collateral
        (address[] memory pools, uint[] memory shares, address[] memory wLps, uint[][] memory ids, uint[][] memory amts)
        = IPosManager(POS_MANAGER).getPosCollInfo(_posId);
        // calculate collateralCredit
        uint collCredit_e54;
        for (uint i; i < pools.length; i = i.uinc()) {
            address token = ILendingPool(pools[i]).underlyingToken();
            uint tokenPrice_e36 = IInitOracle(_oracle).getPrice_e36(token);
            uint tokenValue_e36 = ILendingPool(pools[i]).toAmtCurrent(shares[i]) * tokenPrice_e36;
            TokenFactors memory factors = _config.getTokenFactors(mode, pools[i]);
            collCredit_e54 += tokenValue_e36 * factors.collFactor_e18;
        }
        for (uint i; i < wLps.length; i = i.uinc()) {
            for (uint j; j < ids[i].length; j = j.uinc()) {
                uint wLpPrice_e36 = IBaseWrapLp(wLps[i]).calculatePrice_e36(ids[i][j], _oracle);
                uint wLpValue_e36 = amts[i][j] * wLpPrice_e36;
                TokenFactors memory factors = _config.getTokenFactors(mode, IBaseWrapLp(wLps[i]).lp(ids[i][j]));
                collCredit_e54 += wLpValue_e36 * factors.collFactor_e18;
            }
        }
        collCredit_e36 = collCredit_e54 / ONE_E18;
    }

    /// @inheritdoc IInitCore
    function getBorrowCreditCurrent_e36(uint _posId) public virtual returns (uint borrowCredit_e36) {
        IConfig _config = IConfig(config);
        uint16 mode = _getPosMode(_posId);
        // get position debtShares
        (address[] memory pools, uint[] memory debtShares) = IPosManager(POS_MANAGER).getPosBorrInfo(_posId);
        uint borrowCredit_e54;
        address _oracle = oracle;
        for (uint i; i < pools.length; i = i.uinc()) {
            address token = ILendingPool(pools[i]).underlyingToken();
            uint tokenPrice_e36 = IInitOracle(_oracle).getPrice_e36(token);
            // calculate position debt
            uint tokenValue_e36 = tokenPrice_e36 * ILendingPool(pools[i]).debtShareToAmtCurrent(debtShares[i]);
            TokenFactors memory factors = _config.getTokenFactors(mode, pools[i]);
            borrowCredit_e54 += (tokenValue_e36 * factors.borrFactor_e18);
        }
        borrowCredit_e36 = borrowCredit_e54.ceilDiv(ONE_E18);
    }

    /// @inheritdoc IInitCore
    function getPosHealthCurrent_e18(uint _posId) public virtual returns (uint health_e18) {
        uint borrowCredit_e36 = getBorrowCreditCurrent_e36(_posId);
        health_e18 = borrowCredit_e36 > 0
            ? (getCollateralCreditCurrent_e36(_posId) * ONE_E18) / borrowCredit_e36
            : type(uint).max;
    }

    /// @inheritdoc IInitCore
    function callback(address _to, uint _value, bytes memory _data)
        public
        payable
        virtual
        returns (bytes memory result)
    {
        // call _to with _data
        return ICallbackReceiver(_to).coreCallback{value: _value}(msg.sender, _data);
    }

    /// @inheritdoc IInitCore
    function transferToken(address _token, address _to, uint _amt) public virtual nonReentrant {
        // transfer _amt of token to _to from msg.sender
        IERC20(_token).safeTransferFrom(msg.sender, _to, _amt);
    }

    /// @dev repay borrowed tokens
    /// @param _config config
    /// @param _mode position mode
    /// @param _posId position id
    /// @param _pool pool address to repay
    /// @param _shares amount of shares to repay
    /// @return tokenToRepay token address to repay
    ///         amt          amt of token to repay
    function _repay(IConfig _config, uint16 _mode, uint _posId, address _pool, uint _shares)
        internal
        returns (address tokenToRepay, uint amt)
    {
        // check status
        _require(_config.getPoolConfig(_pool).canRepay && _config.getModeStatus(_mode).canRepay, Errors.REPAY_PAUSED);
        // get position debt share
        uint positionDebtShares = IPosManager(POS_MANAGER).getPosDebtShares(_posId, _pool);
        uint sharesToRepay = _shares < positionDebtShares ? _shares : positionDebtShares;
        // get amtToRepay (accrue interest)
        uint amtToRepay = ILendingPool(_pool).debtShareToAmtCurrent(sharesToRepay);
        // take token from msg.sender to pool
        tokenToRepay = ILendingPool(_pool).underlyingToken();
        IERC20(tokenToRepay).safeTransferFrom(msg.sender, _pool, amtToRepay);
        // update debt on the position
        IPosManager(POS_MANAGER).updatePosDebtShares(_posId, _pool, -sharesToRepay.toInt256());
        // call repay on the pool
        amt = ILendingPool(_pool).repay(sharesToRepay);
        // update debt on mode
        IRiskManager(riskManager).updateModeDebtShares(_mode, _pool, -sharesToRepay.toInt256());
        emit Repay(_pool, _posId, msg.sender, sharesToRepay, amt);
    }

    /// @dev get position mode
    function _getPosMode(uint _posId) internal view returns (uint16 mode) {
        mode = IPosManager(POS_MANAGER).getPosMode(_posId);
    }

    /// @dev get whether the position is healthy
    function _isPosHealthy(uint _posId) internal returns (bool isHealthy) {
        isHealthy = getPosHealthCurrent_e18(_posId) >= ONE_E18;
    }

    /// @dev check that the position health after liquidation does not exceed the threshold
    function _ensurePosHealthAfterLiq(IConfig _config, uint _posId, uint16 _mode) internal {
        uint healthAfterLiquidation_e18 = _config.getMaxHealthAfterLiq_e18(_mode);
        // if healthAfterLiquidation_e18 == uint64.max, then no need to check
        if (healthAfterLiquidation_e18 != type(uint64).max) {
            _require(
                getPosHealthCurrent_e18(_posId) <= healthAfterLiquidation_e18, Errors.INVALID_HEALTH_AFTER_LIQUIDATION
            );
        }
    }

    /// @dev liquidation internal logic
    function _liquidateInternal(uint _posId, address _poolToRepay, uint _repayShares)
        internal
        returns (LiquidateLocalVars memory vars)
    {
        vars.config = IConfig(config);
        vars.mode = _getPosMode(_posId);

        // check position must be unhealthy
        vars.health_e18 = getPosHealthCurrent_e18(_posId);
        _require(vars.health_e18 < ONE_E18, Errors.POSITION_HEALTHY);

        (vars.repayToken, vars.repayAmt) = _repay(vars.config, vars.mode, _posId, _poolToRepay, _repayShares);
    }

    /// @dev validate mode max wlp count internal logic
    function _validateModeMaxWLpCount(IConfig _config, uint16 _mode, uint _posId) internal view {
        _require(
            IPosManager(POS_MANAGER).getPosCollWLpCount(_posId) <= _config.getModeMaxCollWLpCount(_mode),
            Errors.MAX_COLLATERAL_COUNT_REACHED
        );
    }
}
