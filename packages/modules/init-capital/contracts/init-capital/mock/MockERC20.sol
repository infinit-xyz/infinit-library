// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ERC20} from '@openzeppelin-contracts/token/ERC20/ERC20.sol';

contract MockERC20 is ERC20 {
    mapping(address => uint) public mintedAmts;
    mapping(address => uint) public lastMints;
    uint public immutable amtPerDay;
    uint8 private immutable tokenDecimals;

    constructor(string memory _name, string memory _symbol, uint8 _tokenDecimals, uint _maxToken)
        ERC20(_name, _symbol)
    {
        tokenDecimals = _tokenDecimals;
        amtPerDay = _maxToken;
    }

    function mint(uint _mintAmt) public {
        uint lastMinted = lastMints[msg.sender];
        // reset if 1 days passed
        if (block.timestamp - lastMinted > 1 days) mintedAmts[msg.sender] = 0;
        // check if today mint is not exceed the amtPerday
        require(mintedAmts[msg.sender] + _mintAmt <= amtPerDay, 'Minting Amount Exceed Amts Per Day');
        mintedAmts[msg.sender] += _mintAmt;
        lastMints[msg.sender] = block.timestamp;
        _mint(msg.sender, _mintAmt);
    }

    function decimals() public view virtual override returns (uint8) {
        return tokenDecimals;
    }
}
