// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Api3 Server V1 Interface
interface IApi3ServerV1 {
    /// @dev get the token price from data feed id
    /// @param dataFeedId data feed id correlated to the token
    /// @return value the current price of the data feed id
    ///         timestamp last update timestamp
    function readDataFeedWithId(bytes32 dataFeedId) external view returns (int224 value, uint32 timestamp);
}
