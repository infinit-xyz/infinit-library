// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

/// @title Lending Pool Interface
/// @notice rebase token is not supported
interface ILendingPool {
    event SetIrm(address _irm);
    event SetReserveFactor_e18(uint _reserveFactor_e18);
    event SetTreasury(address _treasury);

    /// @dev get core address
    function core() external view returns (address core);

    /// @dev get the interest rate model address
    function irm() external view returns (address model);

    /// @dev get the reserve factor in 1e18 (1e18 = 100%)
    function reserveFactor_e18() external view returns (uint factor_e18);

    /// @dev get the pool's underlying token
    function underlyingToken() external view returns (address token);

    /// @notice total assets = cash + total debts
    function totalAssets() external view returns (uint amt);

    /// @dev get the pool total debt (underlying token)
    function totalDebt() external view returns (uint debt);

    /// @dev get the pool total debt shares
    function totalDebtShares() external view returns (uint shares);

    /// @dev calaculate the debt share from debt amount (without interest accrual)
    /// @param _amt the amount of debt
    /// @return shares amount of debt shares (rounded up)
    function debtAmtToShareStored(uint _amt) external view returns (uint shares);

    /// @dev calaculate the debt share from debt amount (with interest accrual)
    /// @param _amt the amount of debt
    /// @return shares current amount of debt shares (rounded up)
    function debtAmtToShareCurrent(uint _amt) external returns (uint shares);

    /// @dev calculate the corresponding debt amount from debt share (without interest accrual)
    /// @param _shares the amount of debt shares
    /// @return amt corresponding debt amount (rounded up)
    function debtShareToAmtStored(uint _shares) external view returns (uint amt);

    /// @notice this is NOT a view function
    /// @dev calculate the corresponding debt amount from debt share (with interest accrual)
    /// @param _shares the amount of debt shares
    /// @return amt corresponding current debt amount (rounded up)
    function debtShareToAmtCurrent(uint _shares) external returns (uint amt);

    /// @dev get current supply rate per sec in 1e18
    function getSupplyRate_e18() external view returns (uint supplyRate_e18);

    /// @dev get current borrow rate per sec in 1e18
    function getBorrowRate_e18() external view returns (uint borrowRate_e18);

    /// @dev get the pool total cash (underlying token)
    function cash() external view returns (uint amt);

    /// @dev get the latest timestamp of interest accrual
    /// @return lastAccruedTime last accrued time unix timestamp
    function lastAccruedTime() external view returns (uint lastAccruedTime);

    /// @dev get the treasury address
    function treasury() external view returns (address treasury);

    /// @notice only core can call this function
    /// @dev mint shares to the receiver from the transfered assets
    /// @param _receiver address to receive shares
    /// @return mintShares amount of shares minted
    function mint(address _receiver) external returns (uint mintShares);

    /// @notice only core can call this function
    /// @dev burn shares and send the underlying assets to the receiver
    /// @param _receiver address to receive the underlying tokens
    /// @return amt amount of underlying assets transferred
    function burn(address _receiver) external returns (uint amt);

    /// @notice only core can call this function
    /// @dev borrow the asset from the lending pool
    /// @param _receiver address to receive the borrowed asset
    /// @param _amt amount of asset to borrow
    /// @return debtShares debt shares amount recorded from borrowing
    function borrow(address _receiver, uint _amt) external returns (uint debtShares);

    /// @notice only core can call this function
    /// @dev repay the borrowed assets
    /// @param _shares the amount of debt shares to repay
    /// @return amt assets amount used for repay
    function repay(uint _shares) external returns (uint amt);

    /// @dev accrue interest from the last accrual
    function accrueInterest() external;

    /// @dev get the share amounts from underlying asset amt
    /// @param _amt the amount of asset to convert to shares
    /// @return shares amount of shares (rounded down)
    function toShares(uint _amt) external view returns (uint shares);

    /// @dev get the asset amount from shares
    /// @param _shares the amount of shares to convert to underlying asset amt
    /// @return amt amount of underlying asset (rounded down)
    function toAmt(uint _shares) external view returns (uint amt);

    /// @dev get the share amounts from underlying asset amt (with interest accrual)
    /// @param _amt the amount of asset to convert to shares
    /// @return shares current amount of shares (rounded down)
    function toSharesCurrent(uint _amt) external returns (uint shares);

    /// @dev get the asset amount from shares (with interest accrual)
    /// @param _shares the amount of shares to convert to underlying asset amt
    /// @return amt current amount of underlying asset (rounded down)
    function toAmtCurrent(uint _shares) external returns (uint amt);

    /// @dev set the interest rate model
    /// @param _irm new interest rate model address
    function setIrm(address _irm) external;

    /// @dev set the pool's reserve factor in 1e18
    /// @param _reserveFactor_e18 new reserver factor in 1e18
    function setReserveFactor_e18(uint _reserveFactor_e18) external;

    /// @dev set the pool's treasury address
    /// @param _treasury new treasury address
    function setTreasury(address _treasury) external;
}
