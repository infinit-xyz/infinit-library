// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

interface IV2SwapRouter {
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to)
        external
        payable
        returns (uint amountOut);
    function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to)
        external
        payable
        returns (uint amountIn);
}
