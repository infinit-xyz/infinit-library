// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../../common/library/InitErrors.sol';
import '../../common/library/UncheckedIncrement.sol';

import {ILBToken} from '../../interfaces/common/moe_v2/ILBToken.sol';
import {IWLpMoeV2} from '../../interfaces/wrapper/moe_v2/IWLpMoeV2.sol';
import {ILBTokenHolder} from '../../interfaces/wrapper/moe_v2/ILBTokenHolder.sol';
import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';
import {ILBPair} from '../../interfaces/common/moe_v2/ILBPair.sol';
import {ILBHooksRewarder} from '../../interfaces/common/moe_v2/ILBHooksRewarder.sol';
import {Initializable} from '@openzeppelin-contracts-upgradeable/proxy/utils/Initializable.sol';

contract LBTokenHolder is ILBTokenHolder, Initializable {
    using UncheckedIncrement for uint;
    using SafeERC20 for IERC20;

    // immutable
    address public moeLp;
    address public wlpMoeV2;

    // storage
    address public claimer;

    // constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _wLpMoeV2, address _moeLp, address _claimer) external initializer {
        wlpMoeV2 = _wLpMoeV2;
        moeLp = _moeLp;
        claimer = _claimer;
        emit SetClaimer(_claimer);
    }

    // modifiers
    modifier onlyClaimer() {
        _require(msg.sender == claimer, Errors.ONLY_CLAIMER);
        _;
    }

    modifier onlyWLpMoeV2() {
        _require(msg.sender == wlpMoeV2, Errors.ONLY_WLP_MOE_V2);
        _;
    }

    /// @inheritdoc ILBTokenHolder
    function batchClaimRewardTo(address _hooksRewarder, uint[] calldata _ids, address _to) external onlyClaimer {
        // 0. check if the hooks rewarder is whitelisted
        _require(IWLpMoeV2(wlpMoeV2).wlMoeRewarders(_hooksRewarder), Errors.NOT_WHITELISTED);
        // 1.1 claim token from the hookds rewarder
        ILBHooksRewarder(_hooksRewarder).claim(address(this), _ids);
        address rewardToken = address(ILBHooksRewarder(_hooksRewarder).getRewardToken());
        // 1.2 transmit reward token to _to
        uint rewardTokenBalance = _safeBalanceOf(rewardToken, address(this));
        if (rewardTokenBalance != 0) _transmitToken(address(rewardToken), _to, rewardTokenBalance);
        // 2. claim extra reward if extraHooksRewarder is set.
        bytes32 extraHooksParams = ILBHooksRewarder(_hooksRewarder).getExtraHooksParameters();
        // 2.1 get extraHooksRewarder address
        address extraHooksRewarder = _hooksParamsToAddress(extraHooksParams);
        // 2.2 check if the extraHooksRewarder is set
        if (extraHooksRewarder != address(0)) {
            // 2.3 check if the extra rewarder is whitelisted
            _require(IWLpMoeV2(wlpMoeV2).wlMoeRewarders(extraHooksRewarder), Errors.NOT_WHITELISTED);
            address extraRewardToken = address(ILBHooksRewarder(extraHooksRewarder).getRewardToken());
            // 2.4 transmit extra reward token (extra rewarded should be already claimed along with hooksRewarder's claim)
            uint extraRewardTokenBalance = _safeBalanceOf(extraRewardToken, address(this));
            if (extraRewardTokenBalance != 0) {
                _transmitToken(address(extraRewardToken), _to, extraRewardTokenBalance);
            }
        }
    }

    /// @inheritdoc ILBTokenHolder
    function getPendingRewards(address _hooksRewarder, uint[] calldata _ids)
        external
        view
        returns (address[] memory rewardTokens, uint[] memory pendingAmts)
    {
        // check if the rewarder is whitelisted
        _require(IWLpMoeV2(wlpMoeV2).wlMoeRewarders(_hooksRewarder), Errors.NOT_WHITELISTED);
        bytes32 extraHooksParams = ILBHooksRewarder(_hooksRewarder).getExtraHooksParameters();
        address extraHooksRewarder = _hooksParamsToAddress(extraHooksParams);
        // rewardTokens is two if the extraHooksRewarder is set
        rewardTokens = extraHooksRewarder != address(0) ? new address[](2) : new address[](1);
        pendingAmts = new uint[](rewardTokens.length);
        rewardTokens[0] = address(ILBHooksRewarder(_hooksRewarder).getRewardToken());
        // pending amts = current balance + pending amts
        pendingAmts[0] = _safeBalanceOf(rewardTokens[0], address(this))
            + ILBHooksRewarder(_hooksRewarder).getPendingRewards(address(this), _ids);
        if (extraHooksRewarder != address(0)) {
            // check if the extra rewarder is whitelisted
            _require(IWLpMoeV2(wlpMoeV2).wlMoeRewarders(extraHooksRewarder), Errors.NOT_WHITELISTED);
            rewardTokens[1] = address(ILBHooksRewarder(extraHooksRewarder).getRewardToken());
            // pending amts = current balance + pending amts
            pendingAmts[1] = _safeBalanceOf(rewardTokens[1], address(this))
                + ILBHooksRewarder(extraHooksRewarder).getPendingRewards(address(this), _ids);
        }
    }

    /// @inheritdoc ILBTokenHolder
    function batchTransferLBTokenTo(address _to, uint[] calldata _ids, uint[] calldata _amts) external onlyWLpMoeV2 {
        ILBToken(moeLp).batchTransferFrom(address(this), _to, _ids, _amts);
    }

    /// @inheritdoc ILBTokenHolder
    function setClaimer(address _claimer) external onlyClaimer {
        claimer = _claimer;
        emit SetClaimer(_claimer);
    }

    /// @dev get hooks rewarder address from the moe lp
    /// @return hooksRewarderAddress hooks rewarder address
    function getHooksRewarderAddress() external view returns (address hooksRewarderAddress) {
        bytes32 hooksParams = ILBPair(moeLp).getLBHooksParameters();
        hooksRewarderAddress = _hooksParamsToAddress(hooksParams);
    }

    /// @dev get hooks rewarders address from hooks params
    /// @param _hooksParams hooks parameters
    /// @return hooksRewarderAddress rewarder address
    function _hooksParamsToAddress(bytes32 _hooksParams) internal pure returns (address hooksRewarderAddress) {
        hooksRewarderAddress = address(uint160(uint(_hooksParams)));
    }

    /// @dev transmit tokens to the _to address
    /// @param _token token address
    /// @param _to receiver address
    /// @param _amount amount to transmit
    function _transmitToken(address _token, address _to, uint _amount) internal {
        // NOTE: address zero is a native token
        if (_token != address(0)) {
            IERC20(_token).safeTransfer(_to, _amount);
        } else {
            (bool success,) = _to.call{value: _amount}('');
            _require(success, Errors.CALL_FAILED);
        }
    }

    /// @notice address(0) is used for native tokens
    /// @dev get the balance of an account for the given token
    /// @param _token The address of the token
    /// @param _account The address of the account
    /// @return balance The balance of the account for the given token
    function _safeBalanceOf(address _token, address _account) internal view returns (uint balance) {
        // NOTE: address zero is a native token
        balance = address(_token) == address(0) ? address(_account).balance : IERC20(_token).balanceOf(_account);
    }

    receive() external payable {}
}
