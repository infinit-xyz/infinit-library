// SPDX-License-Identifier: None
pragma solidity ^0.8.0;

/// @title Flash Receiver Interface
interface IFlashReceiver {
    /// @dev handle flash callback from core
    /// @param _pools borrowed pool list
    /// @param _amts pool borrow amounts
    /// @param _data the data payload to execute on the callback
    function flashCallback(address[] calldata _pools, uint[] calldata _amts, bytes calldata _data) external;
}
