// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {Order} from '../hook/IMarginTradingHook.sol';

interface IMarginTradingLens {
    /// @dev get position's created order by index
    function getOrders(address _user, uint _posId, uint[] calldata _indices) external view returns (Order[] memory);

    /// @dev get fill order info by order id
    function getFillOrderInfoCurrent(uint _orderId)
        external
        returns (address fillToken, uint fillAmt, address repayToken, uint repayAmt);

    /// @dev get Mark price of quote token / base token
    function getMarkPrice_e36(address _tokenA, address _tokenB) external view returns (uint);
}
