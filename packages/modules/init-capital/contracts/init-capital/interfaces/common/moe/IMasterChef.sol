// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IERC20, IMoe} from './IMoe.sol';
import {IMasterChefRewarder} from './IMasterChefRewarder.sol';

interface IMasterChef {
    function deposit(uint pid, uint amount) external;
    function withdraw(uint pid, uint amount) external;
    function getToken(uint pid) external view returns (IERC20);
    function getPendingRewards(address account, uint[] memory pids)
        external
        view
        returns (uint[] memory moeRewards, IERC20[] memory extraTokens, uint[] memory extraRewards);
    function getDeposit(uint pid, address account) external view returns (uint);
    function getTotalDeposit(uint pid) external view returns (uint);
    function getExtraRewarder(uint pid) external view returns (IMasterChefRewarder);
    function claim(uint[] memory pids) external;
    function getMoe() external view returns (IMoe);
}
