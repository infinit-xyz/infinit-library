pragma solidity ^0.8.19;

import './BaseOwnableQuoterAggregator.sol';
import '../../interfaces/common/agni/IAgniQuoter.sol';

contract AgniQuoterAggregator is BaseOwnableQuoterAggregator {
    constructor(address _quoter) BaseOwnableQuoterAggregator(_quoter) {}

    function getSwapPath(address _tokenIn, address _tokenOut, uint _amountIn)
        external
        override
        returns (uint amountOutMax, bytes memory bestPath)
    {
        bytes[] memory allPaths = swapPaths[_tokenIn][_tokenOut];

        for (uint i; i < allPaths.length; ++i) {
            uint amountOutTmp = IAgniQuoter(quoter).quoteExactInput(allPaths[i], _amountIn);
            if (amountOutTmp > amountOutMax) {
                amountOutMax = amountOutTmp;
                bestPath = allPaths[i];
            }
        }

        if (amountOutMax == 0) {
            revert('why 0???????');
        }
    }
}
