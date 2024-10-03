// SPDX-License-Identifier: NONE
pragma solidity ^0.8.19;

interface IRWADynamicOracle {
    /// @notice Retrieve RWA price data
    function getPrice() external view returns (uint);
}
