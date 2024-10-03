// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';

import {ILBFactory} from './ILBFactory.sol';
import {IJoeFactory} from './IJoeFactory.sol';
import {ILBLegacyPair} from './ILBLegacyPair.sol';
import {ILBToken} from './ILBToken.sol';
import {IWNative} from '../IWNative.sol';

/// @title Liquidity Book Router Interface
/// @author Trader Joe
/// @notice Required interface of LBRouter contract
interface ILBLegacyRouter {
    struct LiquidityParameters {
        IERC20 tokenX;
        IERC20 tokenY;
        uint binStep;
        uint amountX;
        uint amountY;
        uint amountXMin;
        uint amountYMin;
        uint activeIdDesired;
        uint idSlippage;
        int[] deltaIds;
        uint[] distributionX;
        uint[] distributionY;
        address to;
        uint deadline;
    }

    function factory() external view returns (address);

    function wavax() external view returns (address);

    function oldFactory() external view returns (address);

    function getIdFromPrice(ILBLegacyPair LBPair, uint price) external view returns (uint24);

    function getPriceFromId(ILBLegacyPair LBPair, uint24 id) external view returns (uint);

    function getSwapIn(ILBLegacyPair lbPair, uint amountOut, bool swapForY)
        external
        view
        returns (uint amountIn, uint feesIn);

    function getSwapOut(ILBLegacyPair lbPair, uint amountIn, bool swapForY)
        external
        view
        returns (uint amountOut, uint feesIn);

    function createLBPair(IERC20 tokenX, IERC20 tokenY, uint24 activeId, uint16 binStep)
        external
        returns (ILBLegacyPair pair);

    function addLiquidity(LiquidityParameters calldata liquidityParameters)
        external
        returns (uint[] memory depositIds, uint[] memory liquidityMinted);

    function addLiquidityAVAX(LiquidityParameters calldata liquidityParameters)
        external
        payable
        returns (uint[] memory depositIds, uint[] memory liquidityMinted);

    function removeLiquidity(
        IERC20 tokenX,
        IERC20 tokenY,
        uint16 binStep,
        uint amountXMin,
        uint amountYMin,
        uint[] memory ids,
        uint[] memory amounts,
        address to,
        uint deadline
    ) external returns (uint amountX, uint amountY);

    function removeLiquidityAVAX(
        IERC20 token,
        uint16 binStep,
        uint amountTokenMin,
        uint amountAVAXMin,
        uint[] memory ids,
        uint[] memory amounts,
        address payable to,
        uint deadline
    ) external returns (uint amountToken, uint amountAVAX);

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        uint[] memory pairBinSteps,
        IERC20[] memory tokenPath,
        address to,
        uint deadline
    ) external returns (uint amountOut);

    function swapExactTokensForAVAX(
        uint amountIn,
        uint amountOutMinAVAX,
        uint[] memory pairBinSteps,
        IERC20[] memory tokenPath,
        address payable to,
        uint deadline
    ) external returns (uint amountOut);

    function swapExactAVAXForTokens(
        uint amountOutMin,
        uint[] memory pairBinSteps,
        IERC20[] memory tokenPath,
        address to,
        uint deadline
    ) external payable returns (uint amountOut);

    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        uint[] memory pairBinSteps,
        IERC20[] memory tokenPath,
        address to,
        uint deadline
    ) external returns (uint[] memory amountsIn);

    function swapTokensForExactAVAX(
        uint amountOut,
        uint amountInMax,
        uint[] memory pairBinSteps,
        IERC20[] memory tokenPath,
        address payable to,
        uint deadline
    ) external returns (uint[] memory amountsIn);

    function swapAVAXForExactTokens(
        uint amountOut,
        uint[] memory pairBinSteps,
        IERC20[] memory tokenPath,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amountsIn);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        uint[] memory pairBinSteps,
        IERC20[] memory tokenPath,
        address to,
        uint deadline
    ) external returns (uint amountOut);

    function swapExactTokensForAVAXSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMinAVAX,
        uint[] memory pairBinSteps,
        IERC20[] memory tokenPath,
        address payable to,
        uint deadline
    ) external returns (uint amountOut);

    function swapExactAVAXForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        uint[] memory pairBinSteps,
        IERC20[] memory tokenPath,
        address to,
        uint deadline
    ) external payable returns (uint amountOut);

    function sweep(IERC20 token, address to, uint amount) external;

    function sweepLBToken(ILBToken _lbToken, address _to, uint[] calldata _ids, uint[] calldata _amounts) external;
}
