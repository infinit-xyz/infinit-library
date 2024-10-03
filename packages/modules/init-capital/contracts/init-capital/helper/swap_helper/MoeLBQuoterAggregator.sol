pragma solidity ^0.8.19;

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';

import './BaseOwnableQuoterAggregator.sol';
import '../../interfaces/common/moe_v2/ILBQuoter.sol';

contract MoeLBQuoterAggregator is BaseOwnableQuoterAggregator {
    constructor(address _quoter) BaseOwnableQuoterAggregator(_quoter) {}

    function getSwapPath(address _tokenIn, address _tokenOut, uint _amountIn)
        external
        override
        returns (uint amountOutMax, bytes memory bestPath)
    {
        bytes[] memory allPaths = swapPaths[_tokenIn][_tokenOut];
        for (uint i; i < allPaths.length; ++i) {
            address[] memory path = abi.decode(allPaths[i], (address[]));
            ILBQuoter.Quote memory quote = ILBQuoter(quoter).findBestPathFromAmountIn(path, uint128(_amountIn));


            if (quote.amounts[quote.amounts.length - 1] > amountOutMax) {
                IERC20[] memory tokenPath = new IERC20[](quote.route.length);
                for (uint j; j < quote.route.length; ++j) {
                    tokenPath[j] = IERC20(quote.route[j]);
                }
                amountOutMax = quote.amounts[quote.amounts.length - 1];
                bestPath = allPaths[i];
                bestPath = abi.encode(
                    ILBRouter.Path({pairBinSteps: quote.binSteps, versions: quote.versions, tokenPath: tokenPath})
                );
            }
        }

        if (amountOutMax == 0) {
            revert('why 0???????');
        }
    }
}
