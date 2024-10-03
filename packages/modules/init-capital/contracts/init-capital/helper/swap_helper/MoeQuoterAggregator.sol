pragma solidity ^0.8.19;

import './BaseOwnableQuoterAggregator.sol';
import '../../interfaces/common/moe/IMoeRouter.sol';

contract MoeQuoterAggregator is BaseOwnableQuoterAggregator {
    constructor(address _quoter) BaseOwnableQuoterAggregator(_quoter) {}

    function getSwapPath(address _tokenIn, address _tokenOut, uint _amountIn)
        external
        override
        returns (uint amountOutMax, bytes memory bestPath)
    {
        bytes[] memory allPaths = swapPaths[_tokenIn][_tokenOut];

        for (uint i; i < allPaths.length; ++i) {
            if (allPaths[i].length == 0) continue;

            address[] memory path = abi.decode(allPaths[i], (address[]));
            uint[] memory amountsOutTmp = IMoeRouter(quoter).getAmountsOut(_amountIn, path);
            if (amountsOutTmp[path.length - 1] > amountOutMax) {
                amountOutMax = amountsOutTmp[path.length - 1];
                bestPath = allPaths[i];
            }
        }

        if (amountOutMax == 0) {
            revert('why 0???????');
        }
    }
}
