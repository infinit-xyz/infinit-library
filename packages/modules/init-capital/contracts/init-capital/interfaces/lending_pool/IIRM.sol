// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

/// @title Interest Rate Model Interface
interface IIRM {
    /// @notice borrow rate is rate per second in 1e18
    /// @dev get the borrow rate from the interest rate model
    /// @param _cash total cash
    /// @param _debt total debt
    /// @return borrowRate_e18 borrow rate per second in 1e18
    function getBorrowRate_e18(uint _cash, uint _debt) external view returns (uint borrowRate_e18);
}
