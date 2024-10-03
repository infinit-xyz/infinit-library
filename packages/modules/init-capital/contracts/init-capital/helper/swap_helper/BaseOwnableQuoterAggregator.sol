pragma solidity ^0.8.19;

import {Ownable} from '@openzeppelin-contracts/access/Ownable.sol';

abstract contract BaseOwnableQuoterAggregator is Ownable {
    mapping(address tokenIn => mapping(address tokenOut => bytes[] paths)) public swapPaths;
    address public immutable quoter;

    constructor(address _quoter) {
        quoter = _quoter;
    }

    function getSwapPath(address _tokenIn, address _tokenOut, uint _amountIn)
        external
        virtual
        returns (uint amountOutMax, bytes memory bestPath);

    function getPathsLength(address _tokenIn, address _tokenOut) external view virtual returns (uint) {
        return swapPaths[_tokenIn][_tokenOut].length;
    }

    function addSwapInfos(address _tokenIn, address _tokenOut, bytes calldata _path) external virtual onlyOwner {
        swapPaths[_tokenIn][_tokenOut].push(_path);
    }

    function setSwapInfos(address _tokenIn, address _tokenOut, bytes[] memory _paths) external virtual onlyOwner {
        swapPaths[_tokenIn][_tokenOut] = _paths;
    }
}
