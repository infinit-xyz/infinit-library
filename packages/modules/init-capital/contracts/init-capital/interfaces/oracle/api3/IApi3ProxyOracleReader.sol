// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IBaseOracle} from '../IBaseOracle.sol';

/// @notice only supports USD denominated price feed
/// @title Api3 Oracle Reader Interface
interface IApi3ProxyOracleReader is IBaseOracle {
    struct DataFeedInfo {
        address dataFeedProxy; // data feed proxy
        uint maxStaleTime; // max acceptable stale time for last updated time in the UNIX timestamp
    }

    event SetDataFeed(address token, address dataFeedProxy);
    event SetMaxStaleTime(address token, uint maxStaleTime);

    /// @dev get the data feed info for the token
    /// @param _token token address
    /// @return dataFeedProxy data feed id
    ///         maxStaleTime max stale time
    function dataFeedInfos(address _token) external view returns (address dataFeedProxy, uint maxStaleTime);

    /// @dev set the data feed id for the tokens
    /// @param _tokens array of the token addresses
    /// @param _dataFeedProxies the new data feed id for each tokens
    function setDataFeedProxies(address[] calldata _tokens, address[] calldata _dataFeedProxies) external;

    /// @dev set the max stale time for the tokens
    /// @param _tokens token address list
    /// @param _maxStaleTimes new max stale time list
    function setMaxStaleTimes(address[] calldata _tokens, uint[] calldata _maxStaleTimes) external;
}
