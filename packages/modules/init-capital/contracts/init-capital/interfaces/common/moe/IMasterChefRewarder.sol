// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IBaseRewarder} from './IBaseRewarder.sol';

interface IMasterChefRewarder is IBaseRewarder {
    function link(uint pid) external;
    function unlink(uint pid) external;
}
