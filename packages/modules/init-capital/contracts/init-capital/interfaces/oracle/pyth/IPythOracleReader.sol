// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IBaseOracle} from '../IBaseOracle.sol';

/// @title Pyth Oracle Reader Interface
interface IPythOracleReader is IBaseOracle {
    event SetPriceId(address indexed token, bytes32 priceId);
    event SetMaxStaleTime(address indexed token, uint maxStaleTime);
    event SetPyth(address pyth);

    /// @dev get the price id for the token
    /// @param _token token address
    /// @return priceId price id
    function priceIds(address _token) external view returns (bytes32 priceId);

    /// @dev get the max stale time for the token
    /// @param _token token address
    /// @return maxStaleTime max stale time
    function maxStaleTimes(address _token) external view returns (uint maxStaleTime);

    /// @dev get pyth address
    function pyth() external view returns (address);

    /// @dev set the price id for the tokens
    /// @param _tokens token address list
    /// @param _priceIds the new price id for each tokens
    function setPriceIds(address[] calldata _tokens, bytes32[] calldata _priceIds) external;

    /// @dev set new pyth address
    /// @param _pyth new pyth address
    function setPyth(address _pyth) external;

    /// @dev set the max stale time for the tokens
    /// @param _tokens token address list
    /// @param _maxStaleTimes the new max stale time for each tokens
    function setMaxStaleTimes(address[] calldata _tokens, uint[] calldata _maxStaleTimes) external;
}
