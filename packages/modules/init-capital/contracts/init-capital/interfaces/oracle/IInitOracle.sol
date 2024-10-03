// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IBaseOracle} from './IBaseOracle.sol';

/// @title Init Oracle Interface
interface IInitOracle is IBaseOracle {
    event SetPrimarySource(address indexed token, address oracle);
    event SetSecondarySource(address indexed token, address oracle);
    event SetMaxPriceDeviation_e18(address indexed token, uint maxPriceDeviation_e18);

    /// @dev return the oracle token's primary source
    /// @param _token token address
    /// @return primarySource primary oracle address
    function primarySources(address _token) external view returns (address primarySource);

    /// @dev return the oracle token's secondary source
    /// @param _token token address
    /// @return secondarySource secoundary oracle address
    function secondarySources(address _token) external view returns (address secondarySource);

    /// @dev return the max price deviation between the primary and secondary sources
    /// @param _token token address
    /// @return maxPriceDeviation_e18 max price deviation in 1e18
    function maxPriceDeviations_e18(address _token) external view returns (uint maxPriceDeviation_e18);

    /// @dev return the price of the tokens in USD, multiplied by 1e36.
    /// @param _tokens token address list
    /// @return prices_e36 the token prices for each tokens
    function getPrices_e36(address[] calldata _tokens) external view returns (uint[] memory prices_e36);

    /// @dev set primary source for tokens
    /// @param _tokens token address list
    /// @param _sources the primary source address for each tokens
    function setPrimarySources(address[] calldata _tokens, address[] calldata _sources) external;

    /// @dev set secondary source for tokens
    /// @param _tokens token address list
    /// @param _sources the secondary source address for each tokens
    function setSecondarySources(address[] calldata _tokens, address[] calldata _sources) external;

    /// @dev set max price deviation between the primary and sercondary sources
    /// @param _tokens token address list
    /// @param _maxPriceDeviations_e18 the max price deviation in 1e18 for each tokens
    function setMaxPriceDeviations_e18(address[] calldata _tokens, uint[] calldata _maxPriceDeviations_e18) external;
}
