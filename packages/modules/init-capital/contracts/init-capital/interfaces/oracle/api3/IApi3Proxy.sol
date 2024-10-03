// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Api3 Server V1 Interface
interface IApi3Proxy {
    /// @dev get the token price from data feed id
    /// @return value the current price of the data feed id
    ///         timestamp last update timestamp
    function read() external view returns (int224 value, uint32 timestamp);
}
