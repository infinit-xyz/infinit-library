// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IBaseSwapHelper} from '../../interfaces/helper/swap_helper/IBaseSwapHelper.sol';
import {SwapInfo, SwapType} from '../../interfaces/hook/IMarginTradingHook.sol';
import {ILBRouter} from '../../interfaces/common/moe_v2/ILBRouter.sol';

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';

contract MoeLBSwapHelper is IBaseSwapHelper {
    using SafeERC20 for IERC20;

    address public immutable ROUTER;

    constructor(address _router) {
        ROUTER = _router;
    }

    function swap(SwapInfo calldata _swapInfo) external {
        (ILBRouter.Path memory path, uint deadline) = abi.decode(_swapInfo.data, (ILBRouter.Path, uint));
        uint balance = IERC20(_swapInfo.tokenIn).balanceOf(address(this));
        // approve token in for router
        _ensureApprove(_swapInfo.tokenIn, balance);
        if (_swapInfo.swapType == SwapType.CloseExactOut) {
            ILBRouter(ROUTER).swapTokensForExactTokens(_swapInfo.amtOut, balance, path, msg.sender, deadline);
        } else {
            // note: msg.sender should check amtOut
            ILBRouter(ROUTER).swapExactTokensForTokens(balance, _swapInfo.amtOut, path, msg.sender, deadline);
        }
        _refund(_swapInfo.tokenIn);
    }

    function _refund(address _token) internal {
        uint balance = IERC20(_token).balanceOf(address(this));
        if (balance > 0) IERC20(_token).safeTransfer(msg.sender, balance);
    }

    function _ensureApprove(address _token, uint _amt) internal {
        if (IERC20(_token).allowance(address(this), ROUTER) < _amt) {
            IERC20(_token).safeApprove(ROUTER, type(uint).max);
        }
    }
}
