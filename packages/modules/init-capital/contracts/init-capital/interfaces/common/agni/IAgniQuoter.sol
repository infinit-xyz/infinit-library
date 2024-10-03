pragma solidity ^0.8.19;

interface IAgniQuoter {
    function quoteExactInput(bytes memory path, uint amountIn) external returns (uint amountOut);
}
