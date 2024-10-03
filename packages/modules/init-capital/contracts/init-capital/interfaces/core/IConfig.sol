// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {EnumerableSet} from '@openzeppelin-contracts/utils/structs/EnumerableSet.sol';
// structs

struct TokenFactors {
    uint128 collFactor_e18; // collateral factor in 1e18 (1e18 = 100%)
    uint128 borrFactor_e18; // borrow factor in 1e18 (1e18 = 100%)
}

struct ModeConfig {
    EnumerableSet.AddressSet collTokens; // enumerable set of collateral tokens
    EnumerableSet.AddressSet borrTokens; // enumerable set of borrow tokens
    uint64 maxHealthAfterLiq_e18; // max health factor allowed after liquidation
    mapping(address => TokenFactors) factors; // token factors mapping
    ModeStatus status; // mode status
    uint8 maxCollWLpCount; // limit number of wLp to avoid out of gas
}

struct PoolConfig {
    uint128 supplyCap; // pool supply cap
    uint128 borrowCap; // pool borrow cap
    bool canMint; // pool mint status
    bool canBurn; // pool burn status
    bool canBorrow; // pool borrow status
    bool canRepay; // pool repay status
    bool canFlash; // pool flash status
}

struct ModeStatus {
    bool canCollateralize; // mode collateralize status
    bool canDecollateralize; // mode decollateralize status
    bool canBorrow; // mode borrow status
    bool canRepay; // mode repay status
}

/// @title Config Interface
/// @notice Configuration parameters for the protocol.
interface IConfig {
    event SetPoolConfig(address indexed pool, PoolConfig config);
    event SetCollFactors_e18(uint16 indexed mode, address[] tokens, uint128[] _factors);
    event SetBorrFactors_e18(uint16 indexed mode, address[] tokens, uint128[] factors);
    event SetMaxHealthAfterLiq_e18(uint16 indexed mode, uint64 maxHealthAfterLiq_e18);
    event SetWhitelistedWLps(address[] wLps, bool status);
    event SetModeStatus(uint16 mode, ModeStatus status);
    event SetMaxCollWLpCount(uint16 indexed mode, uint8 maxCollWLpCount);

    /// @dev check if the wrapped lp is whitelisted.
    /// @param _wlp wrapped lp address
    /// @return whether the wrapped lp is whitelisted.
    function whitelistedWLps(address _wlp) external view returns (bool);

    /// @dev get mode config
    /// @param _mode mode id
    /// @return collTokens collateral token list
    ///         borrTokens borrow token list
    ///         maxHealthAfterLiq_e18 max health factor allowed after liquidation
    ///         maxCollWLpCount // limit number of wLp to avoid out of gas
    function getModeConfig(uint16 _mode)
        external
        view
        returns (
            address[] memory collTokens,
            address[] memory borrTokens,
            uint maxHealthAfterLiq_e18,
            uint8 maxCollWLpCount
        );

    /// @dev get pool config
    /// @param _pool pool address
    /// @return poolConfig pool config
    function getPoolConfig(address _pool) external view returns (PoolConfig memory poolConfig);

    /// @dev check if the pool within the specified mode is allowed for borrowing.
    /// @param _mode mode id
    /// @param _pool lending pool address
    /// @return whether the pool within the mode is allowed for borrowing.
    function isAllowedForBorrow(uint16 _mode, address _pool) external view returns (bool);

    /// @dev check if the pool within the specified mode is allowed for collateralizing.
    /// @param _mode mode id
    /// @param _pool lending pool address
    /// @return whether the pool within the mode is allowed for collateralizing.
    function isAllowedForCollateral(uint16 _mode, address _pool) external view returns (bool);

    /// @dev get the token factors (collateral and borrow factors)
    /// @param _mode mode id
    /// @param _pool lending pool address
    /// @return tokenFactors token factors
    function getTokenFactors(uint16 _mode, address _pool) external view returns (TokenFactors memory tokenFactors);

    /// @notice if return the value of type(uint64).max, skip the health check after liquidation
    /// @dev get the mode max health allowed after liquidation
    /// @param _mode mode id
    /// @param maxHealthAfterLiq_e18 max allowed health factor after liquidation
    function getMaxHealthAfterLiq_e18(uint16 _mode) external view returns (uint maxHealthAfterLiq_e18);

    /// @dev get the current mode status
    /// @param _mode mode id
    /// @return modeStatus mode status (collateralize, decollateralize, borrow or repay)
    function getModeStatus(uint16 _mode) external view returns (ModeStatus memory modeStatus);

    /// @dev set pool config
    /// @param _pool lending pool address
    /// @param _config new pool config
    function setPoolConfig(address _pool, PoolConfig calldata _config) external;

    /// @dev set pool collateral factors
    /// @param _pools lending pool address list
    /// @param _factors new collateral factor list in 1e18 (1e18 = 100%)
    function setCollFactors_e18(uint16 _mode, address[] calldata _pools, uint128[] calldata _factors) external;

    /// @dev set pool borrow factors
    /// @param _pools lending pool address list
    /// @param _factors new borrow factor list in 1e18 (1e18 = 100%)
    function setBorrFactors_e18(uint16 _mode, address[] calldata _pools, uint128[] calldata _factors) external;

    /// @dev set mode status
    /// @param _status new mode status to set to (collateralize, decollateralize, borrow and repay)
    function setModeStatus(uint16 _mode, ModeStatus calldata _status) external;

    /// @notice only governor role can call
    /// @dev set whitelisted wrapped lp statuses
    /// @param _wLps wrapped lp list
    /// @param _status whitelisted status to set to
    function setWhitelistedWLps(address[] calldata _wLps, bool _status) external;

    /// @dev set max health after liquidation (type(uint64).max means infinite, or no check)
    /// @param _mode mode id
    /// @param _maxHealthAfterLiq_e18 new max allowed health factor after liquidation
    function setMaxHealthAfterLiq_e18(uint16 _mode, uint64 _maxHealthAfterLiq_e18) external;

    /// @dev set mode's max collateral wrapped lp count to avoid out of gas
    /// @param _mode mode id
    /// @param _maxCollWLpCount max collateral wrapped lp count
    function setMaxCollWLpCount(uint16 _mode, uint8 _maxCollWLpCount) external;

    /// @dev get mode's max collateral wlp count
    /// @param _mode mode id
    /// @return the mode's max collateral wlp count
    function getModeMaxCollWLpCount(uint16 _mode) external view returns (uint8);
}
