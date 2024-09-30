// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.0;

interface IUsdt {
    function mint(address, uint256) external;
    function bridgeMint(address, uint256) external;
    function l2Gateway() external view returns (address);
    function transfer(address, uint256) external returns (bool);
    function owner() external view returns (address);
    function approve(address,uint256) external returns(bool);
}
