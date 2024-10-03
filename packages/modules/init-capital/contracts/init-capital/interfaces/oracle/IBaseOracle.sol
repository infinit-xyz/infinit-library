// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

/// @title Base Oracle Interface
interface IBaseOracle {
    /// @dev return the value of the token as USD, multiplied by 1e36.
    /// @param _token token address
    /// @return price_e36 token price in 1e36
    function getPrice_e36(address _token) external view returns (uint price_e36);
}
