// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import './ISwapDataEncoder.sol';

interface ISwapDataRegistry {
    // events
    event SetSwapEncoder(address swapEncoder);
    event SetSwapInfo(address tokenIn, address tokenOut, address router, bytes infos);
    event SetRouterType(address router, uint routerType);

    // functions
    function getCalldata(
        address sender,
        address _tokenIn,
        address _tokenOut,
        SwapOperation _operation,
        address _router,
        uint _amount
    ) external view returns (bytes memory);

    function setSwapInfos(
        address[] calldata _tokenIns,
        address[] calldata _tokenOuts,
        address[] calldata _routers,
        bytes[] calldata _infos
    ) external;

    function setSwapEncoder(address _swapEncoder) external;

    function routerTypes(address _router) external view returns (uint);

    function swapInfos(address _tokenIn, address _tokenOut, address _router) external view returns (bytes memory);
}
