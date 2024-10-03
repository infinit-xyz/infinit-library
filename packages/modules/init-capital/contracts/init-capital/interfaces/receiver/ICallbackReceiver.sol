// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

/// @title Callback Receiver Interface
interface ICallbackReceiver {
    /// @dev handle the callback from core
    /// @param _sender the sender address
    /// @param _data the data payload to execute on the callback
    /// @return result the encoded result of the callback
    function coreCallback(address _sender, bytes calldata _data) external payable returns (bytes memory result);
}
