// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import './IConfig.sol';

/// @title InitCore Interface
interface IInitCore {
    event SetConfig(address indexed newConfig);
    event SetOracle(address indexed newOracle);
    event SetIncentiveCalculator(address indexed newIncentiveCalculator);
    event SetRiskManager(address indexed newRiskManager);
    event Borrow(address indexed pool, uint indexed posId, address indexed to, uint borrowAmt, uint shares);
    event Repay(address indexed pool, uint indexed posId, address indexed repayer, uint shares, uint amtToRepay);
    event CreatePosition(address indexed owner, uint indexed posId, uint16 mode, address viewer);
    event SetPositionMode(uint indexed posId, uint16 mode);
    event Collateralize(uint indexed posId, address indexed pool, uint amt);
    event Decollateralize(uint indexed posId, address indexed pool, address indexed to, uint amt);
    event CollateralizeWLp(uint indexed posId, address indexed wLp, uint indexed tokenId, uint amt);
    event DecollateralizeWLp(uint indexed posId, address indexed wLp, uint indexed tokenId, address to, uint amt);
    event Liquidate(uint indexed posId, address indexed liquidator, address poolOut, uint shares);
    event LiquidateWLp(uint indexed posId, address indexed liquidator, address wLpOut, uint tokenId, uint amt);

    struct LiquidateLocalVars {
        IConfig config;
        uint16 mode;
        uint health_e18;
        uint liqIncentive_e18;
        address collToken;
        address repayToken;
        uint repayAmt;
        uint repayAmtWithLiqIncentive;
    }

    /// @dev get position manager address
    function POS_MANAGER() external view returns (address);

    /// @dev get config address
    function config() external view returns (address);

    /// @dev get oracle address
    function oracle() external view returns (address);

    /// @dev get risk manager address
    function riskManager() external view returns (address);

    /// @dev get liquidation incentive calculator address
    function liqIncentiveCalculator() external view returns (address);

    /// @dev mint lending pool shares (using ∆balance in lending pool)
    /// @param _pool lending pool address
    /// @param _to address to receive share token
    /// @return shares amount of share tokens minted
    function mintTo(address _pool, address _to) external returns (uint shares);

    /// @dev burn lending pool share tokens to receive underlying (using ∆balance in lending pool)
    /// @param _pool lending pool address
    /// @param _to address to receive underlying
    /// @return amt amount of underlying to receive
    function burnTo(address _pool, address _to) external returns (uint amt);

    /// @dev borrow underlying from lending pool
    /// @param _pool lending pool address
    /// @param _amt amount of underlying to borrow
    /// @param _posId position id to account for the borrowing
    /// @param _to address to receive borrow underlying
    /// @return shares the amount of debt shares for the borrowing
    function borrow(address _pool, uint _amt, uint _posId, address _to) external returns (uint shares);

    /// @dev repay debt to the lending pool
    /// @param _pool address of lending pool
    /// @param _shares  debt shares to repay
    /// @param _posId position id to repay debt
    /// @return amt amount of underlying to repaid
    function repay(address _pool, uint _shares, uint _posId) external returns (uint amt);

    /// @dev create a new position
    /// @param _mode position mode
    /// @param _viewer position viewer address
    function createPos(uint16 _mode, address _viewer) external returns (uint posId);

    /// @dev change a position's mode
    /// @param _posId position id to change mode
    /// @param _mode position mode to change to
    function setPosMode(uint _posId, uint16 _mode) external;

    /// @dev collateralize lending pool share tokens to position
    /// @param _posId position id to collateralize to
    /// @param _pool lending pool address
    function collateralize(uint _posId, address _pool) external;

    /// @notice need to check the position's health after decollateralization
    /// @dev decollateralize lending pool share tokens from the position
    /// @param _posId position id to decollateral
    /// @param _pool lending pool address
    /// @param _shares amount of share tokens to decollateralize
    /// @param _to address to receive token
    function decollateralize(uint _posId, address _pool, uint _shares, address _to) external;

    /// @dev collateralize wlp to position
    /// @param _posId position id to collateralize to
    /// @param _wLp wlp token address
    /// @param _tokenId token id of wlp token to collateralize
    function collateralizeWLp(uint _posId, address _wLp, uint _tokenId) external;

    /// @notice need to check position's health after decollateralization
    /// @dev decollateralize wlp from the position
    /// @param _posId position id to decollateralize
    /// @param _wLp wlp token address
    /// @param _tokenId token id of wlp token to decollateralize
    /// @param _amt amount of wlp token to decollateralize
    function decollateralizeWLp(uint _posId, address _wLp, uint _tokenId, uint _amt, address _to) external;

    /// @notice need to check position's health before liquidate & limit health after liqudate
    /// @dev (partial) liquidate the position
    /// @param _posId position id to liquidate
    /// @param _poolToRepay address of lending pool to liquidate
    /// @param _repayShares debt shares to repay
    /// @param _tokenOut pool token to receive for the liquidation
    /// @param _minShares min amount of pool token to receive after liquidate (slippage control)
    /// @return amt the token amount out actually transferred out
    function liquidate(uint _posId, address _poolToRepay, uint _repayShares, address _tokenOut, uint _minShares)
        external
        returns (uint amt);

    /// @notice need to check position's health before liquidate & limit health after liqudate
    /// @dev (partial) liquidate the position
    /// @param _posId position id to liquidate
    /// @param _poolToRepay address of lending pool to liquidate
    /// @param _repayShares debt shares to liquidate
    /// @param _wLp wlp to unwrap for liquidation
    /// @param _tokenId wlp token id to burn for liquidation
    /// @param _minLpOut min amount of lp to receive for liquidation
    /// @return amt the token amount out actually transferred out
    function liquidateWLp(
        uint _posId,
        address _poolToRepay,
        uint _repayShares,
        address _wLp,
        uint _tokenId,
        uint _minLpOut
    ) external returns (uint amt);

    /// @notice caller must implement `flashCallback` function
    /// @dev flashloan underlying tokens from lending pool
    /// @param _pools lending pool address list to flashloan from
    /// @param _amts token amount list to flashloan
    /// @param _data data to execute in the callback function
    function flash(address[] calldata _pools, uint[] calldata _amts, bytes calldata _data) external;

    /// @dev make a callback to the target contract
    /// @param _to target address to receive callback
    /// @param _value msg.value to pass on to the callback
    /// @param _data data to execute callback function
    /// @return result callback result
    function callback(address _to, uint _value, bytes calldata _data) external payable returns (bytes memory result);

    /// @notice this is NOT a view function
    /// @dev get current position's collateral credit in 1e36 (interest accrued up to current timestamp)
    /// @param _posId position id to get collateral credit for
    /// @return credit current position collateral credit
    function getCollateralCreditCurrent_e36(uint _posId) external returns (uint credit);

    /// @dev get current position's borrow credit in 1e36 (interest accrued up to current timestamp)
    /// @param _posId position id to get borrow credit for
    /// @return credit current position borrow credit
    function getBorrowCreditCurrent_e36(uint _posId) external returns (uint credit);

    /// @dev get current position's health factor in 1e18 (interest accrued up to current timestamp)
    /// @param _posId position id to get health factor
    /// @return health current position health factor
    function getPosHealthCurrent_e18(uint _posId) external returns (uint health);

    /// @dev set new config
    function setConfig(address _config) external;

    /// @dev set new oracle
    function setOracle(address _oracle) external;

    /// @dev set new liquidation incentve calculator
    function setLiqIncentiveCalculator(address _liqIncentiveCalculator) external;

    /// @dev set new risk manager
    function setRiskManager(address _riskManager) external;

    /// @dev transfer token from msg.sender to the target address
    /// @param _token token address to transfer
    /// @param _to address to receive token
    /// @param _amt amount of token to transfer
    function transferToken(address _token, address _to, uint _amt) external;
}
