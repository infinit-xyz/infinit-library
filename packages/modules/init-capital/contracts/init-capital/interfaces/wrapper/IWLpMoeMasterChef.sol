// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import './IWrapLpERC20Upgradeable.sol';

interface IWLpMoeMasterChef is IWrapLpERC20Upgradeable {
    // events
    event RemoveReward(uint indexed pid, address indexed token);

    /// @notice user remove reward tokens with caution
    /// @dev guardian remove reward token from pid to avoid out of gas
    /// @param _pid Moe masterchef pool's id
    /// @param _token address of the reward token to remove
    function removeRewardTokens(uint _pid, address _token) external;
}
