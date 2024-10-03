// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

/// @title Risk Manager Interface
interface IRiskManager {
    event SetModeDebtCeilingInfo(uint16 indexed mode, address indexed pool, uint amt);

    struct DebtCeilingInfo {
        uint128 ceilAmt; // debt celing amount
        uint128 debtShares; // current total token debt shares of the mode
    }

    /// @notice only core can call this function
    /// @dev update debt shares
    /// @param _mode mode id
    /// @param _pool pool address
    /// @param _shares debt shares (can be negative)
    function updateModeDebtShares(uint16 _mode, address _pool, int _shares) external;

    /// @dev set mode's borrow cap amount
    /// @param _mode mode id
    /// @param _pools borrow token pool ist
    /// @param _amts debt ceiling amount list
    function setModeDebtCeilingInfo(uint16 _mode, address[] calldata _pools, uint128[] calldata _amts) external;

    /// @dev get mode's debt ceiling amount
    /// @param _mode mode id
    /// @param _pool pool address
    /// @return debt ceiling amt
    function getModeDebtCeilingAmt(uint16 _mode, address _pool) external view returns (uint);

    /// @dev get debt shares
    /// @param _mode mode id
    /// @param _pool pool address
    /// @return debt shares
    function getModeDebtShares(uint16 _mode, address _pool) external view returns (uint);

    /// @notice this is NOT a view function
    /// @dev get current debt amount (with interest accrual)
    /// @param _mode mode id
    /// @param _pool pool address
    /// @return current debt amount
    function getModeDebtAmtCurrent(uint16 _mode, address _pool) external returns (uint);

    /// @dev get stored debt amount (without interest accrual)
    /// @param _mode mode id
    /// @param _pool pool address
    /// @return debt amount
    function getModeDebtAmtStored(uint16 _mode, address _pool) external view returns (uint);
}
