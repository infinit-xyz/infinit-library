// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../common/library/InitErrors.sol';
import {UnderACM} from '../common/UnderACM.sol';
import {BaseMappingIdHook} from './BaseMappingIdHook.sol';

import {
    OrderType,
    OrderStatus,
    SwapType,
    Order,
    MarginPos,
    SwapInfo,
    IMarginTradingHook
} from '../interfaces/hook/IMarginTradingHook.sol';
import {IWNative} from '../interfaces/common/IWNative.sol';
import {IInitCore} from '../interfaces/core/IInitCore.sol';
import {ICallbackReceiver} from '../interfaces/receiver/ICallbackReceiver.sol';
import {IMulticall} from '../interfaces/common/IMulticall.sol';
import {ILendingPool} from '../interfaces/lending_pool/ILendingPool.sol';
import {IPosManager} from '../interfaces/core/IPosManager.sol';
import {IInitOracle} from '../interfaces/oracle/IInitOracle.sol';
import {IBaseSwapHelper} from '../interfaces/helper/swap_helper/IBaseSwapHelper.sol';

import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';
import {Math} from '@openzeppelin-contracts/utils/math/Math.sol';

/// @notice user has to be able to receive native tokens
contract MarginTradingHook is BaseMappingIdHook, UnderACM, IMarginTradingHook, ICallbackReceiver {
    using SafeERC20 for IERC20;
    using Math for uint;

    // constants
    uint private constant ONE_E18 = 1e18;
    uint private constant ONE_E36 = 1e36;
    bytes32 private constant GOVERNOR = keccak256('governor');
    // immutables
    address public immutable WNATIVE;
    // storages
    address public swapHelper;
    mapping(address => mapping(address => address)) private __quoteAssets;
    mapping(uint => Order) private __orders;
    mapping(uint => MarginPos) private __marginPositions;
    mapping(uint => uint[]) private __posOrderIds;
    uint public lastOrderId;

    // modifiers
    modifier onlyGovernor() {
        ACM.checkRole(GOVERNOR, msg.sender);
        _;
    }

    // constructor
    constructor(address _core, address _posManager, address _wNative, address _acm)
        BaseMappingIdHook(_core, _posManager)
        UnderACM(_acm)
    {
        WNATIVE = _wNative;
    }

    // initializer
    function initialize(address _swapHelper) external initializer {
        swapHelper = _swapHelper;
        emit SetSwapHelper(_swapHelper);
    }

    modifier depositNative() {
        if (msg.value != 0) IWNative(WNATIVE).deposit{value: msg.value}();
        _;
    }

    modifier refundNative() {
        _;
        // refund native token
        uint wNativeBal = IERC20(WNATIVE).balanceOf(address(this));
        // NOTE: no need receive function since we will use TransparentUpgradeableProxyReceiveETH
        if (wNativeBal != 0) IWNative(WNATIVE).withdraw(wNativeBal);
        uint nativeBal = address(this).balance;
        if (nativeBal != 0) {
            (bool success,) = payable(msg.sender).call{value: nativeBal}('');
            _require(success, Errors.CALL_FAILED);
        }
    }

    // functions
    /// @inheritdoc IMarginTradingHook
    function openPos(
        uint16 _mode,
        address _viewer,
        address _tokenIn,
        uint _amtIn,
        address _borrPool,
        uint _borrAmt,
        address _collPool,
        bytes calldata _data,
        uint _minAmtOut
    ) external payable depositNative refundNative returns (uint posId, uint initPosId, uint amtOut) {
        initPosId = IInitCore(CORE).createPos(_mode, _viewer);
        address borrToken = ILendingPool(_borrPool).underlyingToken();
        {
            (address baseToken, address quoteToken) = getBaseAssetAndQuoteAsset(
                ILendingPool(_collPool).underlyingToken(), ILendingPool(_borrPool).underlyingToken()
            );
            bool isLongBaseAsset = baseToken != borrToken;
            __marginPositions[initPosId] = MarginPos(_collPool, _borrPool, baseToken, quoteToken, isLongBaseAsset);
        }
        posId = ++lastPosIds[msg.sender];
        initPosIds[msg.sender][posId] = initPosId;
        amtOut = _increasePosInternal(
            IncreasePosInternalParam({
                initPosId: initPosId,
                tokenIn: _tokenIn,
                amtIn: _amtIn,
                borrPool: _borrPool,
                borrAmt: _borrAmt,
                collPool: _collPool,
                data: _data,
                minAmtOut: _minAmtOut
            })
        );
    }

    /// @inheritdoc IMarginTradingHook
    function increasePos(
        uint _posId,
        address _tokenIn,
        uint _amtIn,
        uint _borrAmt,
        bytes calldata _data,
        uint _minAmtOut
    ) external payable depositNative refundNative returns (uint amtOut) {
        uint initPosId = initPosIds[msg.sender][_posId];
        _require(initPosId != 0, Errors.POSITION_NOT_FOUND);
        MarginPos storage marginPos = __marginPositions[initPosId];
        amtOut = _increasePosInternal(
            IncreasePosInternalParam({
                initPosId: initPosId,
                tokenIn: _tokenIn,
                amtIn: _amtIn,
                borrPool: marginPos.borrPool,
                borrAmt: _borrAmt,
                collPool: marginPos.collPool,
                data: _data,
                minAmtOut: _minAmtOut
            })
        );
    }

    /// @dev increase margin pos internal logic
    function _increasePosInternal(IncreasePosInternalParam memory _param) internal returns (uint amtOut) {
        _transmitTokenIn(_param.tokenIn, _param.amtIn);

        // perform multicall to INIT core:
        // 1. borrow tokens
        // 2. callback (perform swap from borr -> coll)
        // 3. deposit collateral tokens
        // 4. collateralize tokens
        bytes[] memory multicallData = new bytes[](4);
        multicallData[0] = abi.encodeWithSelector(
            IInitCore(CORE).borrow.selector, _param.borrPool, _param.borrAmt, _param.initPosId, address(this)
        );
        address collToken = ILendingPool(_param.collPool).underlyingToken();
        address borrToken = ILendingPool(_param.borrPool).underlyingToken();
        _require(_param.tokenIn == collToken || _param.tokenIn == borrToken, Errors.INVALID_INPUT);
        {
            SwapInfo memory swapInfo =
                SwapInfo(_param.initPosId, SwapType.OpenExactIn, borrToken, collToken, _param.minAmtOut, _param.data);
            multicallData[1] =
                abi.encodeWithSelector(IInitCore(CORE).callback.selector, address(this), 0, abi.encode(swapInfo));
        }
        multicallData[2] = abi.encodeWithSelector(IInitCore(CORE).mintTo.selector, _param.collPool, POS_MANAGER);
        multicallData[3] =
            abi.encodeWithSelector(IInitCore(CORE).collateralize.selector, _param.initPosId, _param.collPool);

        // do multicall
        bytes[] memory results = IMulticall(CORE).multicall(multicallData);
        amtOut = abi.decode(abi.decode(results[1], (bytes)), (uint));
        emit IncreasePos(_param.initPosId, _param.tokenIn, borrToken, _param.amtIn, _param.borrAmt);
    }

    /// @inheritdoc IMarginTradingHook
    function addCollateral(uint _posId, uint _amtIn) external payable depositNative refundNative {
        uint initPosId = initPosIds[msg.sender][_posId];
        _require(initPosId != 0, Errors.POSITION_NOT_FOUND);
        MarginPos storage marginPos = __marginPositions[initPosId];
        address collToken = ILendingPool(marginPos.collPool).underlyingToken();
        // transfer in tokens
        _transmitTokenIn(collToken, _amtIn);
        // transfer tokens to collPool
        IERC20(collToken).safeTransfer(marginPos.collPool, _amtIn);
        // mint collateral pool tokens
        IInitCore(CORE).mintTo(marginPos.collPool, POS_MANAGER);
        // collateralize to INIT position
        IInitCore(CORE).collateralize(initPosId, marginPos.collPool);
    }

    /// @inheritdoc IMarginTradingHook
    function removeCollateral(uint _posId, uint _shares, bool _returnNative) external refundNative {
        uint initPosId = initPosIds[msg.sender][_posId];
        _require(initPosId != 0, Errors.POSITION_NOT_FOUND);
        MarginPos storage marginPos = __marginPositions[initPosId];
        address collToken = ILendingPool(marginPos.collPool).underlyingToken();
        // decollateralize collTokens to collPool
        IInitCore(CORE).decollateralize(initPosId, marginPos.collPool, _shares, marginPos.collPool);
        // redeem underlying
        IInitCore(CORE).burnTo(marginPos.collPool, address(this));
        // transfer collateral tokens out
        uint balance = IERC20(collToken).balanceOf(address(this));
        _transmitTokenOut(collToken, balance, _returnNative);
    }

    /// @inheritdoc IMarginTradingHook
    function repayDebt(uint _posId, uint _repayShares)
        external
        payable
        depositNative
        refundNative
        returns (uint repayAmt)
    {
        uint initPosId = initPosIds[msg.sender][_posId];
        _require(initPosId != 0, Errors.POSITION_NOT_FOUND);
        MarginPos storage marginPos = __marginPositions[initPosId];
        address borrPool = marginPos.borrPool;
        // calculate repay shares (if it exceeds position debt share, only repay what's available)
        uint debtShares = IPosManager(POS_MANAGER).getPosDebtShares(initPosId, borrPool);
        if (_repayShares > debtShares) _repayShares = debtShares;
        // get borrow token amount to repay
        address borrToken = ILendingPool(borrPool).underlyingToken();
        uint amtToRepay = ILendingPool(borrPool).debtShareToAmtCurrent(_repayShares);
        // transfer in borrow tokens
        _transmitTokenIn(borrToken, amtToRepay);
        // repay debt to INIT core
        _ensureApprove(borrToken, amtToRepay);
        repayAmt = IInitCore(CORE).repay(borrPool, _repayShares, initPosId);
    }

    /// @inheritdoc IMarginTradingHook
    function reducePos(
        uint _posId,
        uint _collAmt,
        uint _repayShares,
        address _tokenOut,
        uint _minAmtOut,
        bool _returnNative,
        bytes calldata _data
    ) external refundNative returns (uint amtOut) {
        uint initPosId = initPosIds[msg.sender][_posId];
        amtOut = _reducePosInternal(
            ReducePosInternalParam({
                initPosId: initPosId,
                collAmt: _collAmt,
                repayShares: _repayShares,
                tokenOut: _tokenOut,
                data: _data
            })
        );
        // slippage control check
        _require(amtOut >= _minAmtOut, Errors.SLIPPAGE_CONTROL);
        // transfer tokens out
        _transmitTokenOut(_tokenOut, amtOut, _returnNative);
    }

    /// @inheritdoc IMarginTradingHook
    function repayDebtWithCollateral(uint _posId, uint _collAmt, uint _repayShares, bytes calldata _data) external {
        uint initPosId = initPosIds[msg.sender][_posId];
        MarginPos memory marginPos = __marginPositions[initPosId];
        address collToken = ILendingPool(marginPos.collPool).underlyingToken();
        // reduce position
        uint leftAmt = _reducePosInternal(
            ReducePosInternalParam({
                initPosId: initPosId,
                collAmt: _collAmt,
                repayShares: _repayShares,
                tokenOut: collToken, // use token out as collateral token for exact-out swap
                data: _data
            })
        );
        // transfer tokens to collPool
        IERC20(collToken).safeTransfer(marginPos.collPool, leftAmt);
        // mint collateral pool tokens
        IInitCore(CORE).mintTo(marginPos.collPool, POS_MANAGER);
        // collateralize left amount back to position
        IInitCore(CORE).collateralize(initPosId, marginPos.collPool);
    }

    function _reducePosInternal(ReducePosInternalParam memory _param) internal returns (uint amtOut) {
        MarginPos memory marginPos = __marginPositions[_param.initPosId];
        // check collAmt & repay shares
        _require(
            _param.collAmt <= IPosManager(POS_MANAGER).getCollAmt(_param.initPosId, marginPos.collPool),
            Errors.INPUT_TOO_HIGH
        );
        _require(
            _param.repayShares <= IPosManager(POS_MANAGER).getPosDebtShares(_param.initPosId, marginPos.borrPool),
            Errors.INPUT_TOO_HIGH
        );

        address collToken = ILendingPool(marginPos.collPool).underlyingToken();
        address borrToken = ILendingPool(marginPos.borrPool).underlyingToken();
        _require(_param.tokenOut == collToken || _param.tokenOut == borrToken, Errors.INVALID_INPUT);

        uint repayAmt = ILendingPool(marginPos.borrPool).debtShareToAmtCurrent(_param.repayShares);
        _ensureApprove(borrToken, repayAmt);

        // 1. decollateralize collateral tokens
        // 2. redeem underlying collateral tokens
        // 3. callback (perform swap from coll -> borr)
        // 4. repay borrow tokens
        bytes[] memory multicallData = new bytes[](4);
        multicallData[0] = abi.encodeWithSelector(
            IInitCore(CORE).decollateralize.selector,
            _param.initPosId,
            marginPos.collPool,
            _param.collAmt,
            marginPos.collPool
        );
        multicallData[1] = abi.encodeWithSelector(IInitCore(CORE).burnTo.selector, marginPos.collPool, address(this));
        {
            // if expect token out = borr token -> swap all (exact-in)
            // if expect token out = coll token -> swap enough to repay (exact-out)
            SwapType swapType = _param.tokenOut == borrToken ? SwapType.CloseExactIn : SwapType.CloseExactOut;
            SwapInfo memory swapInfo = SwapInfo(_param.initPosId, swapType, collToken, borrToken, repayAmt, _param.data);
            multicallData[2] =
                abi.encodeWithSelector(IInitCore(CORE).callback.selector, address(this), 0, abi.encode(swapInfo));
        }
        multicallData[3] = abi.encodeWithSelector(
            IInitCore(CORE).repay.selector, marginPos.borrPool, _param.repayShares, _param.initPosId
        );

        // do multicall
        IMulticall(CORE).multicall(multicallData);
        amtOut = IERC20(_param.tokenOut).balanceOf(address(this));

        emit ReducePos(_param.initPosId, _param.tokenOut, amtOut, _param.collAmt, repayAmt);
    }

    /// @inheritdoc IMarginTradingHook
    function addStopLossOrder(
        uint _posId,
        uint _triggerPrice_e36,
        address _tokenOut,
        uint _limitPrice_e36,
        uint _collAmt
    ) external returns (uint orderId) {
        orderId = _createOrder(_posId, _triggerPrice_e36, _tokenOut, _limitPrice_e36, _collAmt, OrderType.StopLoss);
    }

    /// @inheritdoc IMarginTradingHook
    function addTakeProfitOrder(
        uint _posId,
        uint _triggerPrice_e36,
        address _tokenOut,
        uint _limitPrice_e36,
        uint _collAmt
    ) external returns (uint orderId) {
        orderId = _createOrder(_posId, _triggerPrice_e36, _tokenOut, _limitPrice_e36, _collAmt, OrderType.TakeProfit);
    }

    /// @inheritdoc IMarginTradingHook
    function cancelOrder(uint _posId, uint _orderId) public {
        uint initPosId = initPosIds[msg.sender][_posId];
        _require(initPosId != 0, Errors.POSITION_NOT_FOUND);
        Order storage order = __orders[_orderId];
        _require(order.initPosId == initPosId, Errors.INVALID_INPUT);
        _require(order.status == OrderStatus.Active, Errors.INVALID_INPUT);
        order.status = OrderStatus.Cancelled;
        emit CancelOrder(initPosId, _orderId);
    }

    /// @inheritdoc IMarginTradingHook
    function fillOrder(uint _orderId) external {
        Order memory order = __orders[_orderId];
        _require(order.status == OrderStatus.Active, Errors.INVALID_INPUT);
        MarginPos memory marginPos = __marginPositions[order.initPosId];
        address collToken = ILendingPool(marginPos.collPool).underlyingToken();
        address borrToken = ILendingPool(marginPos.borrPool).underlyingToken();
        // if position is empty, cancel order
        if (IPosManager(POS_MANAGER).getCollAmt(order.initPosId, marginPos.collPool) == 0) {
            __orders[_orderId].status = OrderStatus.Cancelled;
            emit CancelOrder(order.initPosId, _orderId);
            return;
        }
        // validate trigger price condition
        _validateTriggerPrice(order, marginPos);
        // calculate fill order info
        (uint amtOut, uint repayShares, uint repayAmt) = _calculateFillOrderInfo(order, marginPos, collToken);
        // update order status
        __orders[_orderId].status = OrderStatus.Filled;
        // transfer in repay tokens
        IERC20(borrToken).safeTransferFrom(msg.sender, address(this), repayAmt);
        // repay tokens
        _ensureApprove(borrToken, repayAmt);
        IInitCore(CORE).repay(marginPos.borrPool, repayShares, order.initPosId);
        // decollateralize coll pool tokens to executor
        IInitCore(CORE).decollateralize(order.initPosId, marginPos.collPool, order.collAmt, msg.sender);
        // transfer order owner's desired tokens to the specified recipient
        IERC20(order.tokenOut).safeTransferFrom(msg.sender, order.recipient, amtOut);
        emit FillOrder(order.initPosId, _orderId, order.tokenOut, amtOut);
    }

    /// @inheritdoc ICallbackReceiver
    function coreCallback(address _sender, bytes calldata _data) external payable returns (bytes memory result) {
        _require(msg.sender == CORE, Errors.NOT_INIT_CORE);
        _require(_sender == address(this), Errors.NOT_AUTHORIZED);
        SwapInfo memory swapInfo = abi.decode(_data, (SwapInfo));
        MarginPos memory marginPos = __marginPositions[swapInfo.initPosId];
        uint amtIn = IERC20(swapInfo.tokenIn).balanceOf(address(this));
        IERC20(swapInfo.tokenIn).safeTransfer(swapHelper, amtIn); // transfer all token in to swap helper
        uint amtOutBf = IERC20(swapInfo.tokenOut).balanceOf(address(this));
        // swap helper swap token
        IBaseSwapHelper(swapHelper).swap(swapInfo);
        uint amtOut = IERC20(swapInfo.tokenOut).balanceOf(address(this));
        uint swapAmtOut = amtOut - amtOutBf;
        if (swapInfo.swapType == SwapType.OpenExactIn) {
            // transfer to coll pool to mint
            IERC20(swapInfo.tokenOut).safeTransfer(marginPos.collPool, amtOut);
            emit SwapToIncreasePos(swapInfo.initPosId, swapInfo.tokenIn, swapInfo.tokenOut, amtIn, swapAmtOut);
        } else {
            // transfer to borr pool to repay
            uint amtSwapped = amtIn;
            if (swapInfo.swapType == SwapType.CloseExactOut) {
                // slippage control to make sure that swap helper swap correctly
                _require(swapAmtOut >= swapInfo.amtOut, Errors.SLIPPAGE_CONTROL);
                amtSwapped -= IERC20(swapInfo.tokenIn).balanceOf(address(this));
            }
            emit SwapToReducePos(swapInfo.initPosId, swapInfo.tokenIn, swapInfo.tokenOut, amtSwapped, swapAmtOut);
        }
        result = abi.encode(swapAmtOut);
    }

    /// @inheritdoc IMarginTradingHook
    function setQuoteAsset(address _tokenA, address _tokenB, address _quoteAsset) external onlyGovernor {
        _require(_tokenA != address(0) && _tokenB != address(0), Errors.ZERO_VALUE);
        _require(_quoteAsset == _tokenA || _quoteAsset == _tokenB, Errors.INVALID_INPUT);
        _require(_tokenA != _tokenB, Errors.NOT_SORTED_OR_DUPLICATED_INPUT);
        // sort tokenA and tokenB
        (address token0, address token1) = _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA);
        __quoteAssets[token0][token1] = _quoteAsset;
        emit SetQuoteAsset(token0, token1, _quoteAsset);
    }

    /// @inheritdoc IMarginTradingHook
    function setSwapHelper(address _swapHelper) external onlyGovernor {
        swapHelper = _swapHelper;
        emit SetSwapHelper(_swapHelper);
    }

    /// @inheritdoc IMarginTradingHook
    function getBaseAssetAndQuoteAsset(address _tokenA, address _tokenB)
        public
        view
        returns (address baseAsset, address quoteAsset)
    {
        // sort tokenA and tokenB
        (address token0, address token1) = _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA);
        quoteAsset = __quoteAssets[token0][token1];
        _require(quoteAsset != address(0), Errors.ZERO_VALUE);
        baseAsset = quoteAsset == token0 ? token1 : token0;
    }

    /// @inheritdoc IMarginTradingHook
    function getOrder(uint _orderId) external view returns (Order memory) {
        return __orders[_orderId];
    }

    /// @inheritdoc IMarginTradingHook
    function getMarginPos(uint _initPosId) external view returns (MarginPos memory) {
        return __marginPositions[_initPosId];
    }

    /// @inheritdoc IMarginTradingHook
    function getPosOrdersLength(uint _initPosId) external view returns (uint) {
        return __posOrderIds[_initPosId].length;
    }

    /// @notice _collAmt MUST be > 0
    /// @dev create order internal logic
    function _createOrder(
        uint _posId,
        uint _triggerPrice_e36,
        address _tokenOut,
        uint _limitPrice_e36,
        uint _collAmt,
        OrderType _orderType
    ) internal returns (uint orderId) {
        orderId = ++lastOrderId;
        _require(_collAmt != 0, Errors.ZERO_VALUE);
        uint initPosId = initPosIds[msg.sender][_posId];
        _require(initPosId != 0, Errors.POSITION_NOT_FOUND);
        MarginPos memory marginPos = __marginPositions[initPosId];
        _require(_tokenOut == marginPos.baseAsset || _tokenOut == marginPos.quoteAsset, Errors.INVALID_INPUT);
        uint collAmt = IPosManager(POS_MANAGER).getCollAmt(initPosId, marginPos.collPool);
        _require(_collAmt <= collAmt, Errors.INPUT_TOO_HIGH); // check specified coll amt is feasible

        __orders[orderId] = (
            Order({
                initPosId: initPosId,
                triggerPrice_e36: _triggerPrice_e36,
                limitPrice_e36: _limitPrice_e36,
                collAmt: _collAmt,
                tokenOut: _tokenOut,
                orderType: _orderType,
                status: OrderStatus.Active,
                recipient: msg.sender
            })
        );
        __posOrderIds[initPosId].push(orderId);
        emit CreateOrder(initPosId, orderId, _tokenOut, _triggerPrice_e36, _limitPrice_e36, _collAmt, _orderType);
    }

    /// @inheritdoc IMarginTradingHook
    function cancelAndCreateNewOrder(
        uint _posId,
        uint _orderId,
        uint _triggerPrice_e36,
        address _tokenOut,
        uint _limitPrice_e36,
        uint _collAmt
    ) external returns (uint newOrderId) {
        Order memory order = __orders[_orderId];
        cancelOrder(_posId, _orderId);
        newOrderId = _createOrder(_posId, _triggerPrice_e36, _tokenOut, _limitPrice_e36, _collAmt, order.orderType);
    }

    /// @dev calculate fill order info
    /// @param _order margin order info
    /// @param _marginPos margin pos info
    /// @param _collToken margin pos's collateral token
    function _calculateFillOrderInfo(Order memory _order, MarginPos memory _marginPos, address _collToken)
        internal
        returns (uint amtOut, uint repayShares, uint repayAmt)
    {
        (repayShares, repayAmt, _order.collAmt) = _getFillInfoCurrent(_order, _marginPos);
        uint collTokenAmt = ILendingPool(_marginPos.collPool).toAmtCurrent(_order.collAmt);
        // NOTE: all roundings favor the order owner (amtOut)
        if (_collToken == _order.tokenOut) {
            if (_marginPos.isLongBaseAsset) {
                // long eth hold eth
                // (2 * 1500 - 1500) = 1500 / 1500 = 1 eth
                // ((c * limit - borrow) / limit
                amtOut = collTokenAmt - repayAmt * ONE_E36 / _order.limitPrice_e36;
            } else {
                // short eth hold usdc
                // 2000 - 1 * 1500 = 500 usdc
                // (c - borrow * limit)
                amtOut = collTokenAmt - (repayAmt * _order.limitPrice_e36 / ONE_E36);
            }
        } else {
            if (_marginPos.isLongBaseAsset) {
                // long eth hold usdc
                // (2 * 1500 - 1500) = 1500 usdc
                // ((c * limit - borrow)
                amtOut = (collTokenAmt * _order.limitPrice_e36).ceilDiv(ONE_E36) - repayAmt;
            } else {
                // short eth hold eth
                // (3000 - 1 * 1500) / 1500 = 1 eth
                // (c - borrow * limit) / limit
                amtOut = (collTokenAmt * ONE_E36).ceilDiv(_order.limitPrice_e36) - repayAmt;
            }
        }
    }

    /// @dev validate price for margin order for the margin position
    /// @param _order margin order info
    /// @param _marginPos margin position info
    function _validateTriggerPrice(Order memory _order, MarginPos memory _marginPos) internal view {
        address oracle = IInitCore(CORE).oracle();
        uint markPrice_e36 = IInitOracle(oracle).getPrice_e36(_marginPos.baseAsset).mulDiv(
            ONE_E36, IInitOracle(oracle).getPrice_e36(_marginPos.quoteAsset)
        );
        // validate mark price
        // if long base asset, and order type is to take profit -> mark price should pass the trigger price (>=)
        // if long base asset, and order type is to add stop loss -> mark price should be smaller than the trigger price (<=)
        // if short base asset, and order type is to take profit -> mark price should be smaller than the trigger price (<=)
        // if short base asset, and order type is to add stop loss -> mark price should be larger than the trigger price (>=)
        (_order.orderType == OrderType.TakeProfit) == _marginPos.isLongBaseAsset
            ? _require(markPrice_e36 >= _order.triggerPrice_e36, Errors.INVALID_INPUT)
            : _require(markPrice_e36 <= _order.triggerPrice_e36, Errors.INVALID_INPUT);
    }

    /// @notice if the specified order size is larger than the position's collateral, repay size is scaled proportionally.
    /// @dev calculate repay size and position's collateral of the given margin order
    /// @param _order order info
    /// @param _marginPos margin position info
    /// @return repayAmt repay amount
    /// @return repayShares repay shares
    /// @return newCollAmt new collateral amount
    function _getFillInfoCurrent(Order memory _order, MarginPos memory _marginPos)
        internal
        returns (uint repayAmt, uint repayShares, uint newCollAmt)
    {
        uint totalCollAmt = IPosManager(POS_MANAGER).getCollAmt(_order.initPosId, _marginPos.collPool);
        newCollAmt = _order.collAmt;
        if (newCollAmt > totalCollAmt) newCollAmt = totalCollAmt;
        uint totalDebtShares = IPosManager(POS_MANAGER).getPosDebtShares(_order.initPosId, _marginPos.borrPool);
        repayShares = totalDebtShares * newCollAmt / totalCollAmt;
        repayAmt = ILendingPool(_marginPos.borrPool).debtShareToAmtCurrent(repayShares);
    }

    /// @notice if msg.value is provided, then _amt to expect for the transfer is the amount needed on top of msg.value
    /// @dev transfer _tokenIn in with specific amount
    /// @param _tokenIn token in address
    /// @param _amt token amount to expect (this amount includes msg.value if _tokenIn is wrapped native)
    function _transmitTokenIn(address _tokenIn, uint _amt) internal {
        uint amtToTransfer = _amt;
        if (msg.value != 0) {
            _require(_tokenIn == WNATIVE, Errors.NOT_WNATIVE);
            amtToTransfer = _amt > msg.value ? amtToTransfer - msg.value : 0;
        }
        if (amtToTransfer != 0) IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), amtToTransfer);
    }

    /// @notice if _returnNative is true, this function does nothing
    /// @dev transfer _tokenOut out with specific amount
    /// @param _tokenOut token out address
    /// @param _amt token amount to transfer
    /// @param _returnNative whether to return in native token (only applies in case _tokenOut is wrapped native)
    function _transmitTokenOut(address _tokenOut, uint _amt, bool _returnNative) internal {
        // note: if token out is wNative and return native is true,
        // leave token in this contract to be handled by refundNative modifier
        // else transfer token out to msg.sender
        if (_tokenOut != WNATIVE || !_returnNative) IERC20(_tokenOut).safeTransfer(msg.sender, _amt);
    }

    /// @inheritdoc IMarginTradingHook
    function getPosOrderIds(uint _initPosId) external view returns (uint[] memory) {
        return __posOrderIds[_initPosId];
    }
}
