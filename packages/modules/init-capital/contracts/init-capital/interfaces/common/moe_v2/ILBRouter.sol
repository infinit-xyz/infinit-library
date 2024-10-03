// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';

import {IJoeFactory} from './IJoeFactory.sol';
import {ILBFactory} from './ILBFactory.sol';
import {ILBLegacyFactory} from './ILBLegacyFactory.sol';
import {ILBLegacyRouter} from './ILBLegacyRouter.sol';
import {ILBPair} from './ILBPair.sol';
import {ILBToken} from './ILBToken.sol';
import {IWNative} from '../IWNative.sol';

/**
 * @title Liquidity Book Router Interface
 * @author Trader Joe
 * @notice Required interface of LBRouter contract
 */
interface ILBRouter {
    error LBRouter__SenderIsNotWNATIVE();
    error LBRouter__PairNotCreated(address tokenX, address tokenY, uint binStep);
    error LBRouter__WrongAmounts(uint amount, uint reserve);
    error LBRouter__SwapOverflows(uint id);
    error LBRouter__BrokenSwapSafetyCheck();
    error LBRouter__NotFactoryOwner();
    error LBRouter__TooMuchTokensIn(uint excess);
    error LBRouter__BinReserveOverflows(uint id);
    error LBRouter__IdOverflows(int id);
    error LBRouter__LengthsMismatch();
    error LBRouter__WrongTokenOrder();
    error LBRouter__IdSlippageCaught(uint activeIdDesired, uint idSlippage, uint activeId);
    error LBRouter__AmountSlippageCaught(uint amountXMin, uint amountX, uint amountYMin, uint amountY);
    error LBRouter__IdDesiredOverflows(uint idDesired, uint idSlippage);
    error LBRouter__FailedToSendNATIVE(address recipient, uint amount);
    error LBRouter__DeadlineExceeded(uint deadline, uint currentTimestamp);
    error LBRouter__AmountSlippageBPTooBig(uint amountSlippage);
    error LBRouter__InsufficientAmountOut(uint amountOutMin, uint amountOut);
    error LBRouter__MaxAmountInExceeded(uint amountInMax, uint amountIn);
    error LBRouter__InvalidTokenPath(address wrongToken);
    error LBRouter__InvalidVersion(uint version);
    error LBRouter__WrongNativeLiquidityParameters(
        address tokenX, address tokenY, uint amountX, uint amountY, uint msgValue
    );

    /**
     * @dev This enum represents the version of the pair requested
     * - V1: Joe V1 pair
     * - V2: LB pair V2. Also called legacyPair
     * - V2_1: LB pair V2.1 (current version)
     */
    enum Version {
        V1,
        V2,
        V2_1
    }

    /**
     * @dev The liquidity parameters, such as:
     * - tokenX: The address of token X
     * - tokenY: The address of token Y
     * - binStep: The bin step of the pair
     * - amountX: The amount to send of token X
     * - amountY: The amount to send of token Y
     * - amountXMin: The min amount of token X added to liquidity
     * - amountYMin: The min amount of token Y added to liquidity
     * - activeIdDesired: The active id that user wants to add liquidity from
     * - idSlippage: The number of id that are allowed to slip
     * - deltaIds: The list of delta ids to add liquidity (`deltaId = activeId - desiredId`)
     * - distributionX: The distribution of tokenX with sum(distributionX) = 1e18 (100%) or 0 (0%)
     * - distributionY: The distribution of tokenY with sum(distributionY) = 1e18 (100%) or 0 (0%)
     * - to: The address of the recipient
     * - refundTo: The address of the recipient of the refunded tokens if too much tokens are sent
     * - deadline: The deadline of the transaction
     */
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
        address refundTo;
        uint deadline;
    }

    /**
     * @dev The path parameters, such as:
     * - pairBinSteps: The list of bin steps of the pairs to go through
     * - versions: The list of versions of the pairs to go through
     * - tokenPath: The list of tokens in the path to go through
     */
    struct Path {
        uint[] pairBinSteps;
        Version[] versions;
        IERC20[] tokenPath;
    }

    function getFactory() external view returns (ILBFactory);

    function getLegacyFactory() external view returns (ILBLegacyFactory);

    function getV1Factory() external view returns (IJoeFactory);

    function getLegacyRouter() external view returns (ILBLegacyRouter);

    function getWNATIVE() external view returns (IWNative);

    function getIdFromPrice(ILBPair LBPair, uint price) external view returns (uint24);

    function getPriceFromId(ILBPair LBPair, uint24 id) external view returns (uint);

    function getSwapIn(ILBPair LBPair, uint128 amountOut, bool swapForY)
        external
        view
        returns (uint128 amountIn, uint128 amountOutLeft, uint128 fee);

    function getSwapOut(ILBPair LBPair, uint128 amountIn, bool swapForY)
        external
        view
        returns (uint128 amountInLeft, uint128 amountOut, uint128 fee);

    function createLBPair(IERC20 tokenX, IERC20 tokenY, uint24 activeId, uint16 binStep)
        external
        returns (ILBPair pair);

    function addLiquidity(LiquidityParameters calldata liquidityParameters)
        external
        returns (
            uint amountXAdded,
            uint amountYAdded,
            uint amountXLeft,
            uint amountYLeft,
            uint[] memory depositIds,
            uint[] memory liquidityMinted
        );

    function addLiquidityNATIVE(LiquidityParameters calldata liquidityParameters)
        external
        payable
        returns (
            uint amountXAdded,
            uint amountYAdded,
            uint amountXLeft,
            uint amountYLeft,
            uint[] memory depositIds,
            uint[] memory liquidityMinted
        );

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

    function removeLiquidityNATIVE(
        IERC20 token,
        uint16 binStep,
        uint amountTokenMin,
        uint amountNATIVEMin,
        uint[] memory ids,
        uint[] memory amounts,
        address payable to,
        uint deadline
    ) external returns (uint amountToken, uint amountNATIVE);

    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, Path memory path, address to, uint deadline)
        external
        returns (uint amountOut);

    function swapExactTokensForNATIVE(
        uint amountIn,
        uint amountOutMinNATIVE,
        Path memory path,
        address payable to,
        uint deadline
    ) external returns (uint amountOut);

    function swapExactNATIVEForTokens(uint amountOutMin, Path memory path, address to, uint deadline)
        external
        payable
        returns (uint amountOut);

    function swapTokensForExactTokens(uint amountOut, uint amountInMax, Path memory path, address to, uint deadline)
        external
        returns (uint[] memory amountsIn);

    function swapTokensForExactNATIVE(
        uint amountOut,
        uint amountInMax,
        Path memory path,
        address payable to,
        uint deadline
    ) external returns (uint[] memory amountsIn);

    function swapNATIVEForExactTokens(uint amountOut, Path memory path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amountsIn);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        Path memory path,
        address to,
        uint deadline
    ) external returns (uint amountOut);

    function swapExactTokensForNATIVESupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMinNATIVE,
        Path memory path,
        address payable to,
        uint deadline
    ) external returns (uint amountOut);

    function swapExactNATIVEForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        Path memory path,
        address to,
        uint deadline
    ) external payable returns (uint amountOut);

    function sweep(IERC20 token, address to, uint amount) external;

    function sweepLBToken(ILBToken _lbToken, address _to, uint[] calldata _ids, uint[] calldata _amounts) external;
}
