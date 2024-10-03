// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IBaseWrapLp} from './IBaseWrapLp.sol';

/// @title Wrap Lp ERC721 Interface
interface IWrapLpERC721 is IBaseWrapLp {
    // functions
    /// @dev wrap the lp token to get the wrapped token
    /// @param _lp lp token address
    /// @param _tokenId lp token id
    /// @param _to address to receive the wrapped token
    /// @param _extraData extra data for the wrap
    /// @return id wrapped token id
    function wrap(address _lp, uint _tokenId, address _to, bytes calldata _extraData) external returns (uint id);
}
