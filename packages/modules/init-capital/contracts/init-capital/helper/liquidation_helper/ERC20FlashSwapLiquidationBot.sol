// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../../common/library/UncheckedIncrement.sol';

import {IInitCore} from '../../interfaces/core/IInitCore.sol';
import {IPosManager} from '../../interfaces/core/IPosManager.sol';
import {ILendingPool} from '../../interfaces/lending_pool/ILendingPool.sol';
import {TokenFactors, IConfig} from '../../interfaces/core/IConfig.sol';
import {ILiqIncentiveCalculator} from '../../interfaces/core/ILiqIncentiveCalculator.sol';
import {IInitOracle} from '../../interfaces/oracle/IInitOracle.sol';
import {IMulticall} from '../../interfaces/common/IMulticall.sol';
import {SwapOperation, ISwapDataRegistry} from '../../interfaces/helper/liquidation_helper/ISwapDataRegistry.sol';
import {IInitLens} from '../../interfaces/helper/IInitLens.sol';
import {IWNative} from '../../interfaces/common/IWNative.sol';
import {
    IERC20LiquidationBot,
    ICallbackReceiver
} from '../../interfaces/helper/liquidation_helper/IERC20LiquidationBot.sol';

import '../../interfaces/helper/liquidation_helper/IUniswapV3Fork.sol';
import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';
import {ERC721Holder} from '@openzeppelin-contracts/token/ERC721/utils/ERC721Holder.sol';
import {Math} from '@openzeppelin-contracts/utils/math/Math.sol';
import {Ownable} from '@openzeppelin-contracts/access/Ownable.sol';

contract ERC20FlashSwapLiquidationBot is ERC721Holder, IERC20LiquidationBot, Ownable {
    using SafeERC20 for IERC20;
    using Math for uint;
    using UncheckedIncrement for uint;

    // constants
    uint private constant ONE_E18 = 1e18;
    uint private constant MAX_UINT = type(uint).max;
    uint private constant BPS = 10_000;
    uint8 private constant MODE = 1;
    // immutables
    address private immutable CORE;
    address private immutable POS_MANAGER;
    uint private immutable PLACEHOLDER_ID;
    address private immutable SWAP_DATA_REGISTRY;
    address private immutable ORACLE;
    address private immutable LENS;
    address private immutable WNATIVE;
    uint private immutable BUFFER_BPS;

    mapping(address => address) public flashPools;
    constructor(
        address _core,
        address _posManager,
        address _registry,
        address _lens,
        address _wNative,
        uint _bufferBPS
    ) {
        CORE = _core;
        POS_MANAGER = _posManager;
        SWAP_DATA_REGISTRY = _registry;
        ORACLE = IInitCore(_core).oracle();
        LENS = _lens;
        WNATIVE = _wNative;
        // note: using 1 as mode since it can borrow any token and we don't care about token's factor here
        PLACEHOLDER_ID = IInitCore(_core).createPos(MODE, address(this));
        require(_bufferBPS <= BPS, 'LiquidationBot: INVALID_BUFFER_BPS');
        BUFFER_BPS = _bufferBPS;
    }

    /// @inheritdoc IERC20LiquidationBot
    function flashLiquidate(
        uint _posId,
        address _poolToBorrow,
        address _router,
        address _poolToRepay,
        address _router2,
        address _poolOut,
        uint _minAmtOut
    ) public {
        // flash liquidate
        _flashLiquidate(_posId, _poolToBorrow, _router, _poolToRepay, _router2, _poolOut);
        address tokenOut = ILendingPool(_poolOut).underlyingToken();
        uint balance = IERC20(tokenOut).balanceOf(address(this));
        // slippage check
        require(balance >= _minAmtOut, 'LiquidationBot: INSUFFICIENT_OUTPUT_AMOUNT');
        // transfer remaining to owner
        IERC20(tokenOut).safeTransfer(msg.sender, balance);
    }

    /// @inheritdoc IERC20LiquidationBot
    function flashLiquidateReturnNative(
        uint _posId,
        address _poolToBorrow,
        address _router,
        address _poolToRepay,
        address _router2,
        address _poolOut,
        address _router3,
        uint _minAmtOut
    ) external {
        // flash liquidate
        _flashLiquidate(_posId, _poolToBorrow, _router, _poolToRepay, _router2, _poolOut);
        address collToken = ILendingPool(_poolOut).underlyingToken();
        bool success;
        // swap to wNative if needed
        if (collToken != WNATIVE) {
            // swap to wNative
            _ensureApprove(collToken, _router3);
            // get swap data from registry
            bytes memory swapData = ISwapDataRegistry(SWAP_DATA_REGISTRY).getCalldata(
                address(this),
                collToken,
                WNATIVE,
                SwapOperation.EXACT_IN,
                _router3,
                IERC20(collToken).balanceOf(address(this))
            );
            // swap
            (success,) = _router3.call(swapData);
            require(success, 'LiquidationBot: SWAP_FAILED');
        }
        // withdraw wNative to native
        uint balance = IERC20(WNATIVE).balanceOf(address(this));
        IWNative(WNATIVE).withdraw(balance);
        balance = address(this).balance;
        // slippage check
        require(balance >= _minAmtOut, 'LiquidationBot: INSUFFICIENT_OUTPUT_AMOUNT');
        // transfer to msg.sender
        (success,) = payable(msg.sender).call{value: balance}('');
        require(success, 'LiquidationBot: NATIVE_TRANSFER_FAILED');
    }

        /// @inheritdoc ICallbackReceiver
    function coreCallback(address, bytes calldata _data) external payable override returns (bytes memory result) {
        // NOTE: there are 2 cases for liquidation and flash borrow repayment
        // for liquidate position poolIn == _poolToBorrow of flashLiquidate and poolOut == _poolToRepay of flashLiquidate
        // for repay flash borrow poolIn == _poolOut of flashLiquidate and poolOut == _poolToBorrow of flashLiquidate
        (address router, address poolIn, address poolOut, uint posId, uint repayAmt) =
            abi.decode(_data, (address, address, address, uint, uint));
        uint balance;
        // if posId == PLACEHOLDER_ID, it means flash borrow repayment
        if (posId == PLACEHOLDER_ID) {
            // burn pool for underlying token to swap to repay flash borrow
            balance = IERC20(poolIn).balanceOf(address(this));
            IERC20(poolIn).safeTransfer(poolIn, balance);
            IInitCore(CORE).burnTo(poolIn, address(this));
        }
        address tokenIn = ILendingPool(poolIn).underlyingToken();
        address tokenOut = ILendingPool(poolOut).underlyingToken();
        balance = IERC20(tokenIn).balanceOf(address(this));
        // check if tokenIn is tokenOut no need to swap
        if (tokenIn == tokenOut) return abi.encode(balance);
        // get swap data
        bytes memory swapData = ISwapDataRegistry(SWAP_DATA_REGISTRY).getCalldata(
            address(this),
            tokenIn,
            tokenOut,
            SwapOperation.EXACT_OUT,
            router,
            repayAmt
        );
        // ensure approve tokenIn for router
        _ensureApprove(tokenIn, router);
        // swap
        (bool success,) = router.call(swapData);
        require(success, 'LiquidationBot: SWAP_FAILED');
        return abi.encode(IERC20(tokenOut).balanceOf(address(this)));
    }

    /// @inheritdoc IERC20LiquidationBot
    function getMaxRepayAmt(uint _posId, address _poolToRepay, address _poolOut)
        external
        returns (address repayToken, uint maxRepayAmt)
    {
        (repayToken, maxRepayAmt,,) = _getMaxRepayShares(_posId, _poolToRepay, _poolOut);
    }

    /// @inheritdoc IERC20LiquidationBot
    function getLiquidationInfo(uint _posId)
        external
        returns (address bestPoolToRepay, address bestPoolOut, uint maxRepayAmt)
    {
        // get all coll and borr pools
        (address[] memory collPools,,,,) = IPosManager(POS_MANAGER).getPosCollInfo(_posId);
        (address[] memory borrPools,) = IPosManager(POS_MANAGER).getPosBorrInfo(_posId);
        // get best pool to repay and pool to liquidate from repay value with incentive
        uint maxRepayValWithIncentive_e36;
        for (uint i; i < collPools.length; i = i.uinc()) {
            for (uint j; j < borrPools.length; j = j.uinc()) {
                (address repayToken, uint repayAmt,, uint incentiveMultipler_e18) =
                    _getMaxRepayShares(_posId, borrPools[j], collPools[i]);
                if (repayAmt == 0) continue;
                uint repayVal_e36 = repayAmt * IInitOracle(ORACLE).getPrice_e36(repayToken);
                uint repayValWithIncentive_e36 = repayVal_e36.mulDiv(incentiveMultipler_e18, ONE_E18);
                if (repayValWithIncentive_e36 > maxRepayValWithIncentive_e36) {
                    maxRepayAmt = repayAmt;
                    bestPoolToRepay = borrPools[j];
                    bestPoolOut = collPools[i];
                }
            }
        }
    }

    function _ensureApprove(address _token, address _spender) internal {
        if (IERC20(_token).allowance(address(this), _spender) == 0) {
            IERC20(_token).approve(_spender, MAX_UINT);
        }
    }

    function _getMaxRepayShares(uint _posId, address _poolToRepay, address _poolOut)
        internal
        returns (address repayToken, uint repayAmt, uint repayShares, uint incentiveMultipler_e18)
    {
        address config = IInitCore(CORE).config();
        incentiveMultipler_e18;
        {
            // prepare value for equation
            // get current credit
            uint collCredit_e36 = IInitCore(CORE).getCollateralCreditCurrent_e36(_posId);
            uint borrCredit_e36 = IInitCore(CORE).getBorrowCreditCurrent_e36(_posId);
            // if position is healthy, return 0
            if (collCredit_e36 >= borrCredit_e36) return (repayToken, 0, 0, 0);
            repayToken = ILendingPool(_poolToRepay).underlyingToken();
            uint16 mode = IPosManager(POS_MANAGER).getPosMode(_posId);
            // get incentiveMultipler_e18
            {
                address liqIncentiveCalculator = IInitCore(CORE).liqIncentiveCalculator();
                incentiveMultipler_e18 = ILiqIncentiveCalculator(liqIncentiveCalculator).getLiqIncentiveMultiplier_e18(
                    mode,
                    collCredit_e36 * ONE_E18 / borrCredit_e36,
                    repayToken,
                    ILendingPool(_poolOut).underlyingToken()
                );
            }
            require(incentiveMultipler_e18 != 0, 'LiquidationBot: POSITION_HEALTHY');
            // get max health after liquidation with buffer to avoid rounding error
            uint maxHealthAfterLiquidation_e18 = IConfig(config).getMaxHealthAfterLiq_e18(mode) * BUFFER_BPS / BPS;
            // get token factors
            TokenFactors memory tokenOutFactors = IConfig(config).getTokenFactors(mode, _poolOut);
            TokenFactors memory repayTokenFactors = IConfig(config).getTokenFactors(mode, _poolToRepay);

            // equation: https://hackmd.io/@UZkiPM-qQH6ZHGMsfk-KGQ/SJ06AAp56
            // calculate repayAmt
            // note: repayAmt needs to be divided by token price to get actual amt
            {
                uint numerator = (maxHealthAfterLiquidation_e18 * borrCredit_e36) - (collCredit_e36 * ONE_E18);
                uint denominator = maxHealthAfterLiquidation_e18 * repayTokenFactors.borrFactor_e18;
                denominator -= (tokenOutFactors.collFactor_e18 * incentiveMultipler_e18);
                repayAmt = numerator.mulDiv(ONE_E18, denominator);
            }
        }

        uint repayTokenPrice_e36;
        uint collTokenPrice_e36;
        // get prices
        {
            address[] memory tokens = new address[](2);
            tokens[0] = repayToken;
            tokens[1] = ILendingPool(_poolOut).underlyingToken();

            uint[] memory prices_e36 = IInitOracle(ORACLE).getPrices_e36(tokens);
            repayTokenPrice_e36 = prices_e36[0];
            collTokenPrice_e36 = prices_e36[1];
        }
        // get repayShares
        repayAmt = repayAmt / repayTokenPrice_e36;
        repayShares = ILendingPool(_poolToRepay).debtAmtToShareStored(repayAmt);
        // take min of repayShares and totalDebtShares
        {
            uint totalDebtShares = IPosManager(POS_MANAGER).getPosDebtShares(_posId, _poolToRepay);
            repayShares = repayShares.min(totalDebtShares);
        }
        // calculate real repayAmt from repayShares
        repayAmt = ILendingPool(_poolToRepay).debtShareToAmtStored(repayShares);

        // calculate expectedAmtOut
        uint repayAmtWithIncentive = repayAmt * incentiveMultipler_e18 / ONE_E18;
        uint expectedAmtOut = repayAmtWithIncentive * repayTokenPrice_e36 / collTokenPrice_e36;
        uint collAmt = IPosManager(POS_MANAGER).getCollAmt(_posId, _poolOut);
        uint amtOut = ILendingPool(_poolOut).toAmt(collAmt);
        // check if amtOut < expectedAmtOut
        if (amtOut < expectedAmtOut) {
            // calculate repayAmt with amtOut
            uint repayValWithIncentive = amtOut * collTokenPrice_e36 / repayTokenPrice_e36;
            repayAmt = repayValWithIncentive * ONE_E18 / incentiveMultipler_e18;
            repayShares = ILendingPool(_poolToRepay).debtAmtToShareStored(repayAmt);
        }
    }

    function _flashLiquidate(
        uint _posId,
        address _poolToBorrow,
        address _router,
        address _poolToRepay,
        address _router2,
        address _poolOut
    ) internal {
        require(_posId != PLACEHOLDER_ID, 'LiquidationBot: INVALID_POS_ID');
        // get max repayShares for _poolToRepay and _poolOut
        (address repayToken,, uint repayShares,) = _getMaxRepayShares(_posId, _poolToRepay, _poolOut);
        // approve repayToken for liquidation
        _ensureApprove(repayToken, CORE);
        {
            uint borrAmt;
                address borrToken = ILendingPool(_poolToBorrow).underlyingToken();
            if (_poolToBorrow == _poolToRepay) {
                // get borrAmt to repay
                borrAmt = ILendingPool(_poolToBorrow).debtShareToAmtCurrent(repayShares);
            } else {
                // borrow all available amt
                borrAmt = IInitLens(LENS).modeBorrowableAmt(MODE, _poolToBorrow);
                _ensureApprove(borrToken, CORE);
            }
            bytes memory liqStruct= abi.encode(FlashLiqStruct(_router,_poolToBorrow,_poolToRepay,_router2,_poolOut,repayShares,_posId,borrAmt));

            address pool = flashPools[borrToken];
            require(IUniswapV3PoolFork(pool).token0() == borrToken ||IUniswapV3PoolFork(pool).token1() == borrToken);
            (uint amt0, uint amt1) = IUniswapV3PoolFork(pool).token0() == borrToken ? (borrAmt, uint(0)) : (0, borrAmt);
            IUniswapV3PoolFork(pool).flash(address(this),amt0,amt1, liqStruct);
            
        }
        
    }

    struct FlashLiqStruct {
address router;
address poolToBorrow;
address poolToRepay;
address router2;
address poolOut;
uint repayShares;
uint posId;
uint borrowAmt;
    }
    function agniFlashCallback(uint fee0,uint fee1, bytes calldata _data) external
    {

        FlashLiqStruct memory flashLiqParams= abi.decode(_data, (FlashLiqStruct)); 
        address uToken =ILendingPool(flashLiqParams.poolToBorrow).underlyingToken();
        
        uint flashAmtWithFee= flashLiqParams.borrowAmt+ (fee0 == 0 ? fee1 == 0? 0 : fee1 : fee0);
        bytes[] memory multicallData = new bytes[](2);

        // 1. liquidate
        multicallData[0] =
            abi.encodeWithSelector(IInitCore.liquidate.selector, flashLiqParams.posId, flashLiqParams.poolToRepay, flashLiqParams.repayShares, flashLiqParams.poolOut, 0);
        // 2. callback to address(this) to burn _poolOut and swap to repay flash borrow
        multicallData[1] = abi.encodeWithSelector(
            IInitCore(CORE).callback.selector,
            address(this),
            0,
            abi.encode(flashLiqParams.router2, flashLiqParams.poolOut, flashLiqParams.poolToBorrow, PLACEHOLDER_ID,flashAmtWithFee )
        );
        IMulticall(CORE).multicall(multicallData);

        IERC20(uToken).safeTransfer(msg.sender, flashAmtWithFee);
        
    }

    function fusionXV3FlashCallback(uint fee0,uint fee1, bytes calldata _data) external
    {
        
        FlashLiqStruct memory flashLiqParams= abi.decode(_data, (FlashLiqStruct)); 
        address uToken =ILendingPool(flashLiqParams.poolToBorrow).underlyingToken();
        
        uint flashAmtWithFee= flashLiqParams.borrowAmt+ (fee0 == 0 ? fee1 == 0? 0 : fee1 : fee0);
        bytes[] memory multicallData = new bytes[](2);

        // 1. liquidate
        multicallData[0] =
            abi.encodeWithSelector(IInitCore.liquidate.selector, flashLiqParams.posId, flashLiqParams.poolToRepay, flashLiqParams.repayShares, flashLiqParams.poolOut, 0);
        // 2. callback to address(this) to burn _poolOut and swap to repay flash borrow
        multicallData[1] = abi.encodeWithSelector(
            IInitCore(CORE).callback.selector,
            address(this),
            0,
            abi.encode(flashLiqParams.router2, flashLiqParams.poolOut, flashLiqParams.poolToBorrow, PLACEHOLDER_ID,flashAmtWithFee )
        );
        IMulticall(CORE).multicall(multicallData);
        
        IERC20(uToken).safeTransfer(msg.sender, flashAmtWithFee);
        
    }

    

    receive() external payable {}

    function setflashPools(address[] calldata _flashTokens, address[] calldata _flashPools) external onlyOwner {
        require(_flashTokens.length == _flashPools.length, "L");
        for (uint i; i <_flashTokens.length; ++i) {
            flashPools[_flashTokens[i]] = _flashPools[i];
        }
        
    }

}
