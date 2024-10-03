// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {SwapInfo} from '../../hook/IMarginTradingHook.sol';

interface IBaseSwapHelper {
    function swap(SwapInfo calldata _swapInfo) external;
}
