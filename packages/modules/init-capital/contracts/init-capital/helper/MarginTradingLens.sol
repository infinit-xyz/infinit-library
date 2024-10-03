// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../common/library/InitErrors.sol';

import {IMarginTradingLens} from '../interfaces/helper/IMarginTradingLens.sol';
import {Order, OrderStatus, MarginPos, IMarginTradingHook} from '../interfaces/hook/IMarginTradingHook.sol';
import {IHook} from '../interfaces/hook/IHook.sol';
import {IInitCore} from '../interfaces/core/IInitCore.sol';
import {IInitOracle} from '../interfaces/oracle/IInitOracle.sol';
import {ILendingPool} from '../interfaces/lending_pool/ILendingPool.sol';
import {IPosManager} from '../interfaces/core/IPosManager.sol';

import {Math} from '@openzeppelin-contracts/utils/math/Math.sol';

contract MarginTradingLens is IMarginTradingLens {
    using Math for uint;

    // constants
    uint constant ONE_E36 = 1e36;

    // immutables
    address public immutable HOOK;

    // constructor
    constructor(address _hook) {
        HOOK = _hook;
    }

    // functions
    function getOrders(address _user, uint _posId, uint[] calldata _indices)
        external
        view
        returns (Order[] memory orders)
    {
        orders = new Order[](_indices.length);
        uint initPosId = IHook(HOOK).initPosIds(_user, _posId);
        _require(
            _indices.length <= IMarginTradingHook(HOOK).getPosOrdersLength(initPosId), Errors.ARRAY_LENGTH_MISMATCHED
        );
        uint[] memory posOrderIds = IMarginTradingHook(HOOK).getPosOrderIds(initPosId);
        for (uint i = 0; i < _indices.length; ++i) {
            uint orderId = posOrderIds[_indices[i]];
            orders[i] = IMarginTradingHook(HOOK).getOrder(orderId);
        }
    }

    function getMarkPrice_e36(address _tokenA, address _tokenB) external view returns (uint) {
        (address baseAsset, address quoteAsset) = IMarginTradingHook(HOOK).getBaseAssetAndQuoteAsset(_tokenA, _tokenB);
        address core = IHook(HOOK).CORE();
        address oracle = IInitCore(core).oracle();
        address[] memory tokens = new address[](2);
        tokens[0] = quoteAsset;
        tokens[1] = baseAsset;
        uint[] memory price_e36 = IInitOracle(oracle).getPrices_e36(tokens);

        return price_e36[1].mulDiv(1e36, price_e36[0]);
    }

    function getFillOrderInfoCurrent(uint _orderId)
        external
        returns (address fillToken, uint fillAmt, address repayToken, uint repayAmt)
    {
        Order memory order = IMarginTradingHook(HOOK).getOrder(_orderId);
        _require(order.status == OrderStatus.Active, Errors.INVALID_INPUT);
        MarginPos memory marginPos = IMarginTradingHook(HOOK).getMarginPos(order.initPosId);
        address collToken = ILendingPool(marginPos.collPool).underlyingToken();
        repayToken = ILendingPool(marginPos.borrPool).underlyingToken();
        // fill order
        fillToken = order.tokenOut;
        (fillAmt,, repayAmt) = _fillOrder(order, marginPos, collToken);
    }

    function _fillOrder(Order memory _order, MarginPos memory _marginPos, address _collToken)
        internal
        returns (uint amtOut, uint repayShares, uint repayAmt)
    {
        (repayShares, repayAmt) = _calculateRepaySize(_order, _marginPos);
        uint collTokenAmt = ILendingPool(_marginPos.collPool).toAmtCurrent(_order.collAmt);
        // NOTE: all rounding favour the order owner (amtOut)
        if (_collToken == _order.tokenOut) {
            if (_marginPos.isLongBaseAsset) {
                // long eth hold eth
                // (2 * 1500 - 1500) = 1500 / 1500 = 1 eth
                // ((c * limit - borrow) / limit
                amtOut = (collTokenAmt * _order.limitPrice_e36 - repayAmt * ONE_E36).ceilDiv(_order.limitPrice_e36);
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
                amtOut = (collTokenAmt * _order.limitPrice_e36 - repayAmt * ONE_E36).ceilDiv(ONE_E36);
            } else {
                // short eth hold eth
                // (3000 - 1 * 1500) / 1500 = 1 eth
                // (c - borrow * limit) / limit
                amtOut = ((collTokenAmt * ONE_E36) - (repayAmt * _order.limitPrice_e36)).ceilDiv(_order.limitPrice_e36);
            }
        }
    }

    function _calculateRepaySize(Order memory _order, MarginPos memory _marginPos)
        internal
        returns (uint repayAmt, uint repayShares)
    {
        address posManager = IHook(HOOK).POS_MANAGER();
        uint totalCollAmt = IPosManager(posManager).getCollAmt(_order.initPosId, _marginPos.collPool);
        if (_order.collAmt > totalCollAmt) _order.collAmt = totalCollAmt;
        uint totalDebtShares = IPosManager(posManager).getPosDebtShares(_order.initPosId, _marginPos.borrPool);
        repayShares = _order.collAmt != totalCollAmt ? totalDebtShares * _order.collAmt / totalCollAmt : totalDebtShares;
        repayAmt = ILendingPool(_marginPos.borrPool).debtShareToAmtCurrent(repayShares);
    }
}
