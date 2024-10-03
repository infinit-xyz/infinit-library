// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IBaseSwapHelper} from '../../interfaces/helper/swap_helper/IBaseSwapHelper.sol';
import {SwapInfo, SwapType} from '../../interfaces/hook/IMarginTradingHook.sol';

import {IMoeRouter} from '../../interfaces/common/moe/IMoeRouter.sol';
import {IAgniSwapRouter} from '../../interfaces/common/agni/IAgniSwapRouter.sol';
import {IFusionXSwapRouter} from '../../interfaces/common/fusionx/IFusionXSwapRouter.sol';
import {ILBRouter} from '../../interfaces/common/moe_v2/ILBRouter.sol';

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';

contract UniversalSwapHelper is IBaseSwapHelper {
    using SafeERC20 for IERC20;

    address public constant MOE_ROUTER = 0xeaEE7EE68874218c3558b40063c42B82D3E7232a;
    address public constant AGNI_ROUTER = 0x319B69888b0d11cEC22caA5034e25FfFBDc88421;
    address public constant FUSIONX_ROUTER = 0x5989FB161568b9F133eDf5Cf6787f5597762797F;
    address public constant MOE_LB_ROUTER = 0xAFb85a12Babfafabfe1a518594492d5a830e782a;

    function swap(SwapInfo calldata _swapInfo) external {
        (address router, bytes memory swapData) = abi.decode(_swapInfo.data, (address, bytes));
        if (router == MOE_ROUTER) {
            _swapMoe(_swapInfo, swapData);
        } else if (router == AGNI_ROUTER) {
            _swapAgni(_swapInfo, swapData);
        } else if (router == FUSIONX_ROUTER) {
            _swapFusionX(_swapInfo, swapData);
        } else if (router == MOE_LB_ROUTER) {
            _swapMoeLB(_swapInfo, swapData);
        } else {
            revert('invalid input');
        }
        _refund(_swapInfo.tokenIn);
    }

    function _refund(address _token) internal {
        uint balance = IERC20(_token).balanceOf(address(this));
        if (balance > 0) IERC20(_token).safeTransfer(msg.sender, balance);
    }

    function _ensureApprove(address _token, address _router, uint _amt) internal {
        if (IERC20(_token).allowance(address(this), _router) < _amt) {
            IERC20(_token).safeApprove(_router, type(uint).max);
        }
    }

    function _swapMoe(SwapInfo calldata _swapInfo, bytes memory _swapData) internal {
        (address[] memory path, uint deadline) = abi.decode(_swapData, (address[], uint));
        uint balance = IERC20(_swapInfo.tokenIn).balanceOf(address(this));
        // approve token in for router
        _ensureApprove(_swapInfo.tokenIn, MOE_ROUTER, balance);
        if (_swapInfo.swapType == SwapType.CloseExactOut) {
            IMoeRouter(MOE_ROUTER).swapTokensForExactTokens(_swapInfo.amtOut, balance, path, msg.sender, deadline);
        } else {
            // note: msg.sender should check amtOut
            IMoeRouter(MOE_ROUTER).swapExactTokensForTokens(balance, _swapInfo.amtOut, path, msg.sender, deadline);
        }
    }

    function _swapAgni(SwapInfo calldata _swapInfo, bytes memory _swapData) internal {
        (bytes memory path, uint deadline) = abi.decode(_swapData, (bytes, uint));
        uint balance = IERC20(_swapInfo.tokenIn).balanceOf(address(this));
        // approve token in for router
        _ensureApprove(_swapInfo.tokenIn, AGNI_ROUTER, balance);
        if (_swapInfo.swapType == SwapType.CloseExactOut) {
            IAgniSwapRouter(AGNI_ROUTER).exactOutput(
                IAgniSwapRouter.ExactOutputParams({
                    path: path,
                    recipient: msg.sender,
                    deadline: deadline,
                    amountOut: _swapInfo.amtOut,
                    amountInMaximum: balance
                })
            );
        } else {
            // note: msg.sender should check amtOut
            IAgniSwapRouter(AGNI_ROUTER).exactInput(
                IAgniSwapRouter.ExactInputParams({
                    path: path,
                    recipient: msg.sender,
                    deadline: deadline,
                    amountIn: balance,
                    amountOutMinimum: _swapInfo.amtOut
                })
            );
        }
    }

    function _swapFusionX(SwapInfo calldata _swapInfo, bytes memory _swapData) internal {
        (bytes memory path, uint deadline) = abi.decode(_swapData, (bytes, uint));
        uint balance = IERC20(_swapInfo.tokenIn).balanceOf(address(this));
        // approve token in for router
        _ensureApprove(_swapInfo.tokenIn, FUSIONX_ROUTER, balance);
        if (_swapInfo.swapType == SwapType.CloseExactOut) {
            IFusionXSwapRouter(FUSIONX_ROUTER).exactOutput(
                IFusionXSwapRouter.ExactOutputParams({
                    path: path,
                    recipient: msg.sender,
                    deadline: deadline,
                    amountOut: _swapInfo.amtOut,
                    amountInMaximum: balance
                })
            );
        } else {
            // note: msg.sender should check amtOut
            IFusionXSwapRouter(FUSIONX_ROUTER).exactInput(
                IFusionXSwapRouter.ExactInputParams({
                    path: path,
                    recipient: msg.sender,
                    deadline: deadline,
                    amountIn: balance,
                    amountOutMinimum: _swapInfo.amtOut
                })
            );
        }
    }

    function _swapMoeLB(SwapInfo calldata _swapInfo, bytes memory _swapData) internal {
        (ILBRouter.Path memory path, uint deadline) = abi.decode(_swapData, (ILBRouter.Path, uint));
        uint balance = IERC20(_swapInfo.tokenIn).balanceOf(address(this));
        // approve token in for router
        _ensureApprove(_swapInfo.tokenIn, MOE_LB_ROUTER, balance);
        if (_swapInfo.swapType == SwapType.CloseExactOut) {
            ILBRouter(MOE_LB_ROUTER).swapTokensForExactTokens(_swapInfo.amtOut, balance, path, msg.sender, deadline);
        } else {
            // note: msg.sender should check amtOut
            ILBRouter(MOE_LB_ROUTER).swapExactTokensForTokens(balance, _swapInfo.amtOut, path, msg.sender, deadline);
        }
    }
}
