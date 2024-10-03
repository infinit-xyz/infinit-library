// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

interface IMoePair {
    function token0() external view returns (address);
    function token1() external view returns (address);
    function totalSupply() external view returns (uint);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function kLast() external view returns (uint);
    function mint(address to) external returns (uint liquidity);
}
