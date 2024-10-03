// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

interface IRebaseHelper {
    /// @dev non-rebase token (ex. wsteth)
    function YIELD_BEARING_TOKEN() external view returns (address);

    /// @dev rebase token (ex. steth)
    function REBASE_TOKEN() external view returns (address);

    /// @dev wrap the rebase token to yield bearing token then send to _to (ex. steth->wsteth)
    /// @param _to address to receive the wrapped token
    /// @return amtOut amount of token out
    function wrap(address _to) external returns (uint amtOut);

    /// @dev unwrap the yield bearing token to rebase token then send to _to (ex. wsteth->steth)
    /// @param _to address to receive the unwrapped token
    /// @return amtOut amount of token out
    function unwrap(address _to) external returns (uint amtOut);
}
