// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../../interfaces/helper/rebase_helper/IRebaseHelper.sol';

abstract contract BaseRebaseHelper is IRebaseHelper {
    // immutables
    /// @inheritdoc IRebaseHelper
    address public immutable YIELD_BEARING_TOKEN;
    /// @inheritdoc IRebaseHelper
    address public immutable REBASE_TOKEN;

    // constructor
    constructor(address _yieldBearingToken, address _rebaseToken) {
        YIELD_BEARING_TOKEN = _yieldBearingToken;
        REBASE_TOKEN = _rebaseToken;
    }
}
