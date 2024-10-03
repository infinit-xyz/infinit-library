// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

/// @title Access Control Manager Interface
interface IAccessControlManager {
    /// @dev check the role of the user, revert against an unauthorized user.
    /// @param _role keccak256 hash of role name
    /// @param _user user address to check for the role
    function checkRole(bytes32 _role, address _user) external;
}
