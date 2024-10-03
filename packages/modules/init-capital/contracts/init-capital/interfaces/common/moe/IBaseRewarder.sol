// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';

interface IBaseRewarder {
    function getToken() external view returns (IERC20);
    function getCaller() external view returns (address);
    function getPid() external view returns (uint);
    function getRewarderParameter()
        external
        view
        returns (IERC20 token, uint rewardPerSecond, uint lastUpdateTimestamp, uint endTimestamp);
    function getPendingReward(address account, uint balance, uint totalSupply)
        external
        view
        returns (IERC20 token, uint pendingReward);
    function isStopped() external view returns (bool);
    function initialize(address initialOwner) external;
    function setRewardPerSecond(uint rewardPerSecond, uint expectedDuration) external;
    function setRewarderParameters(uint rewardPerSecond, uint startTimestamp, uint expectedDuration) external;
    function stop() external;
    function sweep(IERC20 token, address account) external;
    function onModify(address account, uint pid, uint oldBalance, uint newBalance, uint totalSupply)
        external
        returns (uint);
}
