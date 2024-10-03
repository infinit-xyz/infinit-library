// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

interface IHook {
    /// @dev get last user's position id
    /// @param _user user address
    /// @return posId last user's position id
    function lastPosIds(address _user) external view returns (uint posId);

    /// @dev get the init position id (nft id)
    /// @param _user user address
    /// @param _posId position id
    /// @return initPosId init position id (nft id)
    function initPosIds(address _user, uint _posId) external view returns (uint initPosId);

    /// @dev get init core address
    /// @return core core address
    function CORE() external view returns (address core);

    /// @dev get init posManager address
    /// @return posManager posManager address
    function POS_MANAGER() external view returns (address posManager);
}
