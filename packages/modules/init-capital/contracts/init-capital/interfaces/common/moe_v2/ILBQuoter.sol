// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import {ILBRouter} from './ILBRouter.sol';

interface ILBQuoter {
    struct Quote {
        address[] route;
        address[] pairs;
        uint[] binSteps;
        ILBRouter.Version[] versions;
        uint128[] amounts;
        uint128[] virtualAmountsWithoutSlippage;
        uint128[] fees;
    }

    function findBestPathFromAmountIn(address[] calldata route, uint128 amountIn)
        external
        view
        returns (Quote memory quote);
}
