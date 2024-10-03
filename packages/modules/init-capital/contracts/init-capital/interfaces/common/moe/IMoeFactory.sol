// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

interface IMoeFactory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);

    function createPair(address tokenA, address tokenB) external returns (address pair);
}
