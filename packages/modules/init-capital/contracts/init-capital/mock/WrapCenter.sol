// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../common/library/InitErrors.sol';
import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {IERC721} from '@openzeppelin-contracts/token/ERC721/IERC721.sol';
import {ERC721Holder} from '@openzeppelin-contracts/token/ERC721/utils/ERC721Holder.sol';
import {IWrapLpERC20} from '../interfaces/wrapper/IWrapLpERC20.sol';
import {IWrapLpERC721} from '../interfaces/wrapper/IWrapLpERC721.sol';
import {IWrapCenter} from '../interfaces/wrapper/IWrapCenter.sol';
import {IRebaseHelper} from '../interfaces/helper/rebase_helper/IRebaseHelper.sol';
import {IWNative} from '../interfaces/common/IWNative.sol';
import {ICallbackReceiver} from '../interfaces/receiver/ICallbackReceiver.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';

contract WrapCenter is ICallbackReceiver, IWrapCenter, ERC721Holder {
    using SafeERC20 for IERC20;

    // immutables
    address public immutable CORE;
    address public immutable WNATIVE;

    // constructor
    constructor(address _core, address _wNative) {
        CORE = _core;
        WNATIVE = _wNative;
    }

    // functions
    /// @inheritdoc ICallbackReceiver
    function coreCallback(address, bytes calldata _data) external payable returns (bytes memory result) {
        _require(msg.sender == CORE, Errors.NOT_INIT_CORE);
        bool success;
        (success, result) = address(this).call{value: msg.value}(_data);
        _require(success, Errors.CALL_FAILED);
    }

    /// @inheritdoc IWrapCenter
    function wrapNative(address _to) external payable returns (uint amt) {
        amt = msg.value;
        IWNative(WNATIVE).deposit{value: amt}();
        IERC20(WNATIVE).safeTransfer(_to, amt);
    }

    /// @inheritdoc IWrapCenter
    function unwrapNative(address _to) external returns (uint amt) {
        amt = IERC20(WNATIVE).balanceOf(address(this));
        IWNative(WNATIVE).withdraw(amt);
        (bool success,) = payable(_to).call{value: address(this).balance}('');
        _require(success, Errors.CALL_FAILED);
    }

    /// @inheritdoc IWrapCenter
    function wrapRebase(address _helper, address _to) external returns (uint amountOut) {
        // NOTE: helper will use balanceOf to wrap all tokens
        return IRebaseHelper(_helper).wrap(_to);
    }

    /// @inheritdoc IWrapCenter
    function unwrapRebase(address _helper, address _to) external returns (uint amountOut) {
        // NOTE: helper will use balanceOf to unwrap all tokens
        return IRebaseHelper(_helper).unwrap(_to);
    }

    /// @inheritdoc IWrapCenter
    function wrapLp(address _wLp, address _lp, address _to, bytes calldata _data) external returns (uint tokenId) {
        uint amt = IERC20(_lp).balanceOf(address(this));
        _approve(_lp, _wLp, amt);
        tokenId = IWrapLpERC20(_wLp).wrap(_lp, amt, _to, _data);
    }

    /// @inheritdoc IWrapCenter
    function wrapLpERC721(address _wLp, address _lp, uint _lpId, address _to, bytes calldata _data)
        external
        returns (uint tokenId)
    {
        _approveForAll(_lp, _wLp);
        tokenId = IWrapLpERC721(_wLp).wrap(_lp, _lpId, _to, _data);
    }

    function _approve(address _token, address _spender, uint _amount) internal {
        if (IERC20(_token).allowance(address(this), _spender) < _amount) {
            IERC20(_token).safeApprove(_spender, type(uint).max);
        }
    }

    function _approveForAll(address _token, address _spender) internal {
        if (!IERC721(_token).isApprovedForAll(address(this), _spender)) {
            IERC721(_token).setApprovalForAll(_spender, true);
        }
    }
}
