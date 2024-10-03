// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {ICallbackReceiver} from '../receiver/ICallbackReceiver.sol';

/// @title Wrap Center Interface
interface IWrapCenter is ICallbackReceiver {
    /// @dev get init core address
    /// @return CORE init core address
    function CORE() external view returns (address);

    /// @dev get the wrapped native token address
    /// @return WNATIVE wrapped native
    function WNATIVE() external view returns (address);

    /// @dev wrap the native token to get the wrapped token
    /// @param _to address to receive the wrapped token
    /// @return amt wrapped amount
    function wrapNative(address _to) external payable returns (uint amt);

    /// @dev unwrap the wrapped token to get the native token
    /// @param _to address to receive the native token
    /// @return amt unwrapped amount
    function unwrapNative(address _to) external returns (uint amt);

    /// @dev wrap the rebase token then send to _to
    /// @param _to address to receive the wrapped token
    /// @return amountOut amount of token out
    function wrapRebase(address _helper, address _to) external returns (uint amountOut);

    /// @dev unwrap the rebase token then send to _to
    /// @param _to address to receive the wrapped token
    /// @return amountOut amount of token out
    function unwrapRebase(address _helper, address _to) external returns (uint amountOut);

    /// @dev wrap the lp token (ERC20) to get the wrapped token
    /// @param _wLp address of the wrap lp token
    /// @param _lp address of the lp token
    /// @param _to address to receive the wrapped token
    /// @param _data extra data for the wrap
    /// @return tokenId id of the wrapped token
    function wrapLp(address _wLp, address _lp, address _to, bytes calldata _data) external returns (uint tokenId);

    /// @dev wrap the lp token (ERC721) to get the wrapped token
    /// @param _wLp address of the wrap lp token
    /// @param _lp address of the lp token
    /// @param _lpId id of the lp token
    /// @param _to address to receive the wrapped token
    /// @param _data extra data for the wrap
    /// @return tokenId id of the wrapped token
    function wrapLpERC721(address _wLp, address _lp, uint _lpId, address _to, bytes calldata _data)
        external
        returns (uint tokenId);
}
