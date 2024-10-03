pragma solidity ^0.8.19;

interface IUniswapV3PoolFork {

    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function flash(
        address recipient,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external;

    function token0() external view returns(address);

    function token1() external view returns(address);

    
function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        
        
        returns (uint256 amountOut);

}