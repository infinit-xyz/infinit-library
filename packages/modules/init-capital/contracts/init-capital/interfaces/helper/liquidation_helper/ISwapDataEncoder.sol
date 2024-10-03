// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

struct ExactInputParams {
    bytes path;
    address recipient;
    uint deadline;
    uint amountIn;
    uint amountOutMinimum;
}

struct ExactOutputParams {
    bytes path;
    address recipient;
    uint deadline;
    uint amountOut;
    uint amountInMaximum;
}

interface ISwapRouter {
    // ====================== uniswap v2  =====================

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    // ====================== uniswap v3 =====================
    function exactInput(ExactInputParams memory params) external payable returns (uint amountOut);

    function exactOutput(ExactOutputParams calldata params) external payable returns (uint amountIn);
}

enum SwapOperation {
    EXACT_IN,
    EXACT_OUT
}

struct UniswapV2SwapInfo {
    address[] path;
}

struct UniswapV3SwapInfo {
    // encode of [token0, fee, token1, fee, token2, ...]
    bytes path;
}

interface ISwapEncoder {
    function getCalldata(
        address _swapper,
        bytes memory _swapInfo,
        SwapOperation _operation,
        uint _routerType,
        uint _amount
    ) external view returns (bytes memory);
}
