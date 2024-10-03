pragma solidity ^0.8.19;

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';

interface ILBHooksRewarder {
    function getRewardToken() external view returns (IERC20);
    function getPendingRewards(address user, uint[] calldata ids) external view returns (uint pendingRewards);
    function claim(address user, uint[] calldata ids) external;
    function getExtraHooksParameters() external view returns (bytes32 extraHooksParameters);
}
