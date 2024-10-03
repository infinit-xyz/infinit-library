// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../../common/library/UncheckedIncrement.sol';
import {
    SwapOperation,
    ISwapEncoder,
    ISwapDataRegistry
} from '../../interfaces/helper/liquidation_helper/ISwapDataRegistry.sol';

import {Ownable} from '@openzeppelin-contracts/access/Ownable.sol';

contract SwapDataRegistry is Ownable, ISwapDataRegistry {
    using UncheckedIncrement for uint;

    // mapping token in => token out => router => bytes data
    mapping(address => mapping(address => mapping(address => bytes))) public swapInfos; // swap data for each combination of token in, token out, and router
    // NOTE: use uint instead of enum to avoid code upgrade
    // example:
    // 1: uniswap v2
    // 2: uniswap v3
    // mapping router => types
    mapping(address => uint) public routerTypes;
    address public swapEncoder;

    // constructor
    constructor(address _swapEncoder) Ownable() {
        _setSwapEncoder(_swapEncoder);
    }

    // functions
    function getCalldata(
        address _sender,
        address _tokenIn,
        address _tokenOut,
        SwapOperation _operation,
        address _router,
        uint _amount
    ) external view returns (bytes memory) {
        return ISwapEncoder(swapEncoder).getCalldata(
            _sender, swapInfos[_tokenIn][_tokenOut][_router], _operation, routerTypes[_router], _amount
        );
    }

    function setRouterTypes(address[] calldata _routers, uint[] calldata _types) external onlyOwner {
        require(_routers.length == _types.length, 'length mismatch');
        for (uint i; i < _routers.length; i = i.uinc()) {
            routerTypes[_routers[i]] = _types[i];
            emit SetRouterType(_routers[i], _types[i]);
        }
    }

    function setSwapInfos(
        address[] calldata _tokenIns,
        address[] calldata _tokenOuts,
        address[] calldata _routers,
        bytes[] calldata _infos
    ) external onlyOwner {
        require(
            _tokenIns.length == _tokenOuts.length || _tokenIns.length == _routers.length
                || _tokenIns.length == _infos.length,
            'length mismatch'
        );
        for (uint i; i < _tokenIns.length; i = i.uinc()) {
            require(routerTypes[_routers[i]] != 0, 'unregistered router');
            swapInfos[_tokenIns[i]][_tokenOuts[i]][_routers[i]] = _infos[i];
            emit SetSwapInfo(_tokenIns[i], _tokenOuts[i], _routers[i], _infos[i]);
        }
    }

    function setSwapEncoder(address _swapEncoder) external onlyOwner {
        _setSwapEncoder(_swapEncoder);
    }

    function _setSwapEncoder(address _swapEncoder) internal {
        swapEncoder = _swapEncoder;
        emit SetSwapEncoder(_swapEncoder);
    }
}
