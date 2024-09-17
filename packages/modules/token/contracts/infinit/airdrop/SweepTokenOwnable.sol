// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract SweepTokenOwnable is Ownable {
  using SafeERC20 for IERC20;
  event Swept(address indexed token, address indexed to, uint amount);

  constructor(address owner) Ownable(owner) {}

  function sweep(address token, uint amount) external onlyOwner {
    IERC20(token).safeTransfer(msg.sender, amount);
    emit Swept(token, msg.sender, amount);
  }
}
