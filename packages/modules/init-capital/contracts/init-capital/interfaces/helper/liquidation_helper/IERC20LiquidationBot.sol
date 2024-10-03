// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../../receiver/ICallbackReceiver.sol';

interface IERC20LiquidationBot is ICallbackReceiver {
    /// @dev flash borrow liquidate a position
    /// @param _posId position id to liquidate
    /// @param _poolToBorrow pool to flash borrow
    /// @param _router router to swap _poolToborrow's underlying to _poolToRepay's underlying
    /// @param _poolToRepay pool to repay
    /// @param _router2 router to swap _poolToRepay's underlying to _poolOut's underlying
    /// @param _poolOut pool to receive liquidated underlying
    /// @param _minAmtOut min amount of _poolOut's underlying to receive
    function flashLiquidate(
        uint _posId,
        address _poolToBorrow,
        address _router,
        address _poolToRepay,
        address _router2,
        address _poolOut,
        uint _minAmtOut
    ) external;

    /// @dev flash borrow liquidate a position and swap to native token
    /// @param _posId position id to liquidate
    /// @param _poolToBorrow pool to flash borrow
    /// @param _router router to swap _poolToborrow's underlying to _poolToRepay's underlying
    /// @param _poolToRepay pool to repay
    /// @param _router2 router to swap _poolToRepay's underlying to _poolOut's underlying
    /// @param _poolOut pool to receive liquidated underlying
    /// @param _router3 router to swap _poolOut's underlying to native token
    /// @param _minAmtOut min amount of native token to receive
    function flashLiquidateReturnNative(
        uint _posId,
        address _poolToBorrow,
        address _router,
        address _poolToRepay,
        address _router2,
        address _poolOut,
        address _router3,
        uint _minAmtOut
    ) external;

    /// @dev get max amount of underlying to repay a position
    /// @param _posId position id to liquidate
    /// @param _poolToRepay pool to repay
    /// @param _poolOut pool to receive liquidated underlying
    /// @return repayToken the token to repay
    /// @return maxRepayAmt max amount of underlying to repay
    function getMaxRepayAmt(uint _posId, address _poolToRepay, address _poolOut)
        external
        returns (address repayToken, uint maxRepayAmt);

    /// @dev get liquidation info
    /// @param _posId position id to liquidate
    /// @return bestPoolToRepay pool to repay
    /// @return bestPoolOut pool to receive liquidated underlying
    /// @return maxRepayAmt max amount of underlying to repay
    function getLiquidationInfo(uint _posId)
        external
        returns (address bestPoolToRepay, address bestPoolOut, uint maxRepayAmt);
}
