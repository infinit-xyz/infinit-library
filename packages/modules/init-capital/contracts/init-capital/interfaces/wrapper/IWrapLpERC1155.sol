// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IBaseWrapLp} from './IBaseWrapLp.sol';

/// @title Wrap Lp ERC1155 Interface
interface IWrapLpERC1155 is IBaseWrapLp {
    /// @dev wrap the lp token to get the wrapped token
    /// @param _lp lp token address
    /// @param _ids list of id token to wrap
    /// @param _amts list of id token amount to wrap
    /// @param _to address to receive the wrapped token
    /// @param _extraData extra data for the wrap
    /// @return id wrapped token id
    function wrap(address _lp, uint[] calldata _ids, uint[] calldata _amts, address _to, bytes calldata _extraData)
        external
        returns (uint id);
}
