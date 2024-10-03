// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

/// @title Liquidation Incentive Calculator Interface
interface ILiqIncentiveCalculator {
    event SetModeLiqIncentiveMultiplier_e18(uint16[] modes, uint[] multipliers_e18);
    event SetTokenLiqIncentiveMultiplier_e18(address[] tokens, uint[] multipliers_e18);
    event SetMaxLiqIncentiveMultiplier_e18(uint maxIncentiveMultiplier_e18);
    event SetMinLiqIncentiveMultiplier_e18(uint16[] modes, uint[] minIncentiveMultipliers_e18);

    /// @notice the minimum capped value for the liquidation incentive multiplier
    /// @dev get the min incentive multiplier
    /// @dev _mode position mode
    /// @return minLiqIncentiveMultiplier_e18  min incentive multiplier in 1e18
    function minLiqIncentiveMultiplier_e18(uint16 _mode) external returns (uint minLiqIncentiveMultiplier_e18);

    /// @notice the maximum capped value for the liquidation incentive multiplier
    /// @dev get the max incentive multiplier
    /// @return maxLiqIncentiveMultiplier_e18  max incentive multiplier in 1e18
    function maxLiqIncentiveMultiplier_e18() external returns (uint maxLiqIncentiveMultiplier_e18);

    /// @dev get the mode liquidation incentive multiplier
    /// @param _mode position mode
    /// @return modeLiqIncentiveMultiplier_e18  mode incentive multiplier in 1e18
    function modeLiqIncentiveMultiplier_e18(uint16 _mode) external returns (uint modeLiqIncentiveMultiplier_e18);

    /// @dev get the liquidation incentive multiplier for the token
    /// @param _token token address
    /// @return tokenLiqIncentiveMultiplier_e18 token incentive multiplier in 1e18
    function tokenLiqIncentiveMultiplier_e18(address _token) external returns (uint tokenLiqIncentiveMultiplier_e18);

    /// @dev calculate the liquidation incentive multiplier, given the position's mode, health factor and repay and collateral tokens
    /// @param _mode position mode
    /// @param _healthFactor_e18 position current health factor in 1e18
    /// @param _repayToken repay token's underlying
    /// @param _collToken receive token's underlying
    /// @return multiplier_e18 liquidation incentive multiplier in 1e18
    function getLiqIncentiveMultiplier_e18(
        uint16 _mode,
        uint _healthFactor_e18,
        address _repayToken,
        address _collToken
    ) external view returns (uint multiplier_e18);

    /// @dev set the liquidation incentive multipliers for position modes
    /// @param _modes position mode id list
    /// @param _multipliers_e18 new mode liquidation incentive multiplier list in 1e18 to set to
    function setModeLiqIncentiveMultiplier_e18(uint16[] calldata _modes, uint[] calldata _multipliers_e18) external;

    /// @dev set the liquidation incentive multipliers for tokens
    /// @param _tokens token list
    /// @param _multipliers_e18 new token liquidation incentive multiplier list in 1e18 to set to
    function setTokenLiqIncentiveMultiplier_e18(address[] calldata _tokens, uint[] calldata _multipliers_e18)
        external;

    /// @dev set the max liquidation incentive multiplier
    /// @param _maxLiqIncentiveMultiplier_e18 new max liquidation incentive multiplier in 1e18
    function setMaxLiqIncentiveMultiplier_e18(uint _maxLiqIncentiveMultiplier_e18) external;

    /// @dev set the min liquidation incentive multiplier
    /// @param _modes position mode id list
    /// @param _minMultipliers_e18 new min liquidation incentive multiplier in 1e18
    function setMinLiqIncentiveMultiplier_e18(uint16[] calldata _modes, uint[] calldata _minMultipliers_e18) external;
}
