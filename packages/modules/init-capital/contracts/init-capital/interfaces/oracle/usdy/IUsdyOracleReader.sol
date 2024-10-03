// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IBaseOracle} from '../IBaseOracle.sol';

/// @notice only supports USD denominated price feed
/// @title USDY Oracle Reader Interface
interface IUsdyOracleReader is IBaseOracle {
    /// @dev get Ondo's RWADynamicOracle address
    function RWA_DYNAMIC_ORACLE() external view returns (address);
}
