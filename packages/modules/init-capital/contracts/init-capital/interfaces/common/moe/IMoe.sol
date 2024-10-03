// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';

interface IMoe is IERC20 {
    function getMinter() external view returns (address);
    function getMaxSupply() external view returns (uint);
    function mint(address account, uint amount) external returns (uint);
}
