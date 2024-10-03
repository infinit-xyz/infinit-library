// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IBaseOracle} from '../IBaseOracle.sol';

/// @notice only supports USD denominated price feed
/// @title Api3 Oracle Reader Interface
interface ILsdApi3OracleReader is IBaseOracle {
    struct DataFeedInfo {
        bytes32 dataFeedId; // dataFeedId for the lsd exchange rate (dApi)
        address quoteToken; // quote token address of the lsd exchange rate (ex: wsteth:steth = quote token is steth)
        uint96 maxStaleTime; // max acceptable stale time for last updated time in the UNIX timestamp
    }

    event SetDataFeed(address indexed token, bytes32 dataFeedId);
    event SetQuoteToken(address indexed token, address quoteToken);
    event SetMaxStaleTime(address indexed token, uint maxStaleTime);

    /// @dev get the api3OracleReader address
    function api3OracleReader() external view returns (address);

    /// @dev get the data feed info for the token
    /// @param _token token address
    /// @return dataFeedId data feed id
    ///         quoteToken quote token address
    ///         maxStaleTime max stale time
    function dataFeedInfos(address _token)
        external
        view
        returns (bytes32 dataFeedId, address quoteToken, uint96 maxStaleTime);

    /// @dev set new api3 oracle reader address
    /// @param _api3OracleReader new api3 oracle reader address
    function setApi3OracleReader(address _api3OracleReader) external;

    /// @dev set the data feed id for the tokens
    /// @param _tokens array of the token addresses
    /// @param _dataFeedIds the new data feed id for each tokens
    function setDataFeedIds(address[] calldata _tokens, bytes32[] calldata _dataFeedIds) external;

    /// @dev set the quote token for the exchange rate
    /// @param _tokens array of the token addresses
    /// @param _quoteTokens the new quote token for each tokens
    function setQuoteTokens(address[] calldata _tokens, address[] calldata _quoteTokens) external;

    /// @dev set the max stale time for the tokens
    /// @param _tokens token address list
    /// @param _maxStaleTimes new max stale time list
    function setMaxStaleTimes(address[] calldata _tokens, uint96[] calldata _maxStaleTimes) external;
}