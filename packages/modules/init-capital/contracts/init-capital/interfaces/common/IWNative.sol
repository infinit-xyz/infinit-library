// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';

/// @title Wrapped Native Interface
interface IWNative is IERC20 {
    /// @dev wrap the native token to wrapped token using `msg.value` as the amount
    function deposit() external payable;

    /// @dev unwrap the wrapped token to native token
    /// @param amount token amount to unwrap
    function withdraw(uint amount) external;
}
