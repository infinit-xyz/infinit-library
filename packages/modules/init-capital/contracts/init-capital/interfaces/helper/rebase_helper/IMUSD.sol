// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

interface IMUSD {
    /// @dev non-rebase balance
    /// @param _account address to query
    function sharesOf(address _account) external view returns (uint);

    /// @dev transfer token using non-rebase balance
    function transferShares(address _to, uint _shares) external;

    /// @dev wrap _amt USDY to mUSD
    function wrap(uint _amt) external;

    /// @dev unwrap _amt mUSD to USDY
    function unwrap(uint _amt) external;
}
