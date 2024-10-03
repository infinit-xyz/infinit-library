// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import './BaseRebaseHelper.sol';
import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';
import {IMUSD} from '../../interfaces/helper/rebase_helper/IMUSD.sol';

contract mUSDUSDYHelper is BaseRebaseHelper {
    using SafeERC20 for IERC20;

    // constructor
    constructor(address _yieldBearingToken, address _rebaseToken) BaseRebaseHelper(_yieldBearingToken, _rebaseToken) {
        IERC20(_yieldBearingToken).safeApprove(_rebaseToken, type(uint).max);
    }

    // functions
    /// @inheritdoc IRebaseHelper
    function wrap(address _to) external override returns (uint amtOut) {
        uint balance = IERC20(REBASE_TOKEN).balanceOf(address(this));
        IMUSD(REBASE_TOKEN).unwrap(balance);
        amtOut = IERC20(YIELD_BEARING_TOKEN).balanceOf(address(this));
        IERC20(YIELD_BEARING_TOKEN).safeTransfer(_to, amtOut);
    }

    /// @inheritdoc IRebaseHelper
    function unwrap(address _to) external override returns (uint amtOut) {
        uint balance = IERC20(YIELD_BEARING_TOKEN).balanceOf(address(this));
        IMUSD(REBASE_TOKEN).wrap(balance);
        amtOut = IERC20(REBASE_TOKEN).balanceOf(address(this));
        IMUSD(REBASE_TOKEN).transferShares(_to, IMUSD(REBASE_TOKEN).sharesOf(address(this)));
    }
}
