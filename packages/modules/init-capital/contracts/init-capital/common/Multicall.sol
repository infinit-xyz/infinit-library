// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../interfaces/common/IMulticall.sol';
import '../common/library/UncheckedIncrement.sol';

/// @title Multicall
abstract contract Multicall is IMulticall {
    using UncheckedIncrement for uint;

    /// @inheritdoc IMulticall
    function multicall(bytes[] calldata _data) public payable virtual returns (bytes[] memory results) {
        results = new bytes[](_data.length);
        for (uint i; i < _data.length; i = i.uinc()) {
            (bool success, bytes memory result) = address(this).delegatecall(_data[i]);

            if (!success) {
                try this.getRevertMessage(result) returns (string memory message) {
                    revert(message); // revert if call does not succeed
                } catch {
                    revert('MC'); // default revert message if things go wrong
                }
            }

            results[i] = result;
        }
    }

    /// @dev helper function to decode revert message from low-level call return data
    function getRevertMessage(bytes memory _data) external pure returns (string memory) {
        // if length < 68, then the call failed silently
        if (_data.length < 68) return 'MC';
        // otherwise, decode revert message (strip first 4 bytes of signature hash)

        // 1) pad 28 bytes in front (so we can use abi.decode to decode the 1st 32 bytes out)
        bytes memory paddedData = abi.encodePacked(bytes28(0), _data);
        // 2) modify the memory offset
        paddedData[63] = 0x40; // modify the memory offset to follow the first 64 bytes
        // 3) decode
        (, string memory message) = abi.decode(paddedData, (uint, string));
        return message;
    }
}
