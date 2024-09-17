// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol';

import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @dev Extension of {ERC20} that adds a set of accounts with the {MinterRole},
 * which have permission to mint (create) new tokens as they see fit.
 *
 * At construction, the deployer of the contract is the only minter.
 */
contract InfinitERC20 is Ownable, ERC20Capped, ERC20Permit {
  constructor(
    address owner,
    string memory name,
    string memory symbol,
    uint maxSupply,
    uint initialSupply
  ) Ownable(owner) ERC20(name, symbol) ERC20Permit(name) ERC20Capped(maxSupply) {
    _mint(owner, initialSupply);
  }
  /**
   * @dev See {ERC20-_mint}.
   *
   * Requirements:
   *
   * - the caller must have the {MinterRole}.
   */
  function mint(address account, uint256 amount) public onlyOwner returns (bool) {
    _mint(account, amount);
    return true;
  }

  function _update(address from, address to, uint256 value) internal virtual override(ERC20Capped, ERC20) {
    ERC20Capped._update(from, to, value);
  }
}
