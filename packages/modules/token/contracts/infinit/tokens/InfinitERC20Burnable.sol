// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';

import './InfinitERC20.sol';

contract InfinitERC20Burnable is InfinitERC20, ERC20Burnable {
  constructor(
    address owner,
    string memory name,
    string memory symbol,
    uint maxSupply,
    uint initialSupply
  ) InfinitERC20(owner, name, symbol, maxSupply, initialSupply) {}

  function _update(address from, address to, uint256 value) internal virtual override(InfinitERC20, ERC20) {
    ERC20Capped._update(from, to, value);
  }
}
