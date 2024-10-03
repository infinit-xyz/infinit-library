// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IBaseOracle} from '../IBaseOracle.sol';

/// @notice only supports USD denominated price feed
/// @title Api3 Oracle Reader Interface
interface IApi3OracleReader is IBaseOracle {
    struct DataFeedInfo {
        bytes32 dataFeedId; // dataFeedId for the token price (dApi)
        uint maxStaleTime; // max acceptable stale time for last updated time in the UNIX timestamp
    }

    event SetApi3ServerV1(address api3ServerV1);
    event SetDataFeed(address token, bytes32 dataFeedId);
    event SetMaxStaleTime(address token, uint maxStaleTime);

    /// @dev get the api3 server v1 address
    /// @return api3ServerV1 api3 server v1 address
    function api3ServerV1() external view returns (address);

    /// @dev get the data feed info for the token
    /// @param _token token address
    /// @return dataFeedId data feed id
    ///         maxStaleTime max stale time
    function dataFeedInfos(address _token) external view returns (bytes32 dataFeedId, uint maxStaleTime);

    /// @dev set the data feed id for the tokens
    /// @param _tokens array of the token addresses
    /// @param _dataFeedIds the new data feed id for each tokens
    function setDataFeedIds(address[] calldata _tokens, bytes32[] calldata _dataFeedIds) external;

    /// @dev set new api3 server v1 address
    /// @param _api3ServerV1 new api3 server v1 address
    function setApi3ServerV1(address _api3ServerV1) external;

    /// @dev set the max stale time for the tokens
    /// @param _tokens token address list
    /// @param _maxStaleTimes new max stale time list
    function setMaxStaleTimes(address[] calldata _tokens, uint[] calldata _maxStaleTimes) external;
}