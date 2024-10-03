// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

/// @title Multicall Interface
interface IMulticall {
    /// @dev Perform multiple calls according to the provided _data. Reverts with reason if any of the calls failed.
    /// @notice `msg.value` should not be trusted or used in the multicall data.
    /// @param _data The encoded function data for each subcall.
    /// @return results The call results, if success.
    function multicall(bytes[] calldata _data) external payable returns (bytes[] memory results);
}
