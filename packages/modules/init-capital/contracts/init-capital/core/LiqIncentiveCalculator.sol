// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../common/library/InitErrors.sol';
import {Errors} from '../common/library/InitErrors.sol';
import {UncheckedIncrement} from '../common/library/UncheckedIncrement.sol';
import {UnderACM} from '../common/UnderACM.sol';
import {ILiqIncentiveCalculator} from '../interfaces/core/ILiqIncentiveCalculator.sol';

import {Initializable} from '@openzeppelin-contracts-upgradeable/proxy/utils/Initializable.sol';
import {Math} from '@openzeppelin-contracts/utils/math/Math.sol';

contract LiqIncentiveCalculator is ILiqIncentiveCalculator, UnderACM, Initializable {
    using UncheckedIncrement for uint;

    // constants
    uint private constant ONE_E18 = 1e18;
    bytes32 private constant GOVERNOR = keccak256('governor');

    // storages
    uint public maxLiqIncentiveMultiplier_e18; // @inheritdoc ILiqIncentiveCalculator
    mapping(uint16 => uint) public modeLiqIncentiveMultiplier_e18; // @inheritdoc ILiqIncentiveCalculator
    mapping(address => uint) public tokenLiqIncentiveMultiplier_e18; // @inheritdoc ILiqIncentiveCalculator
    mapping(uint16 => uint) public minLiqIncentiveMultiplier_e18; // @inheritdoc ILiqIncentiveCalculator

    // modifiers
    modifier onlyGovernor() {
        ACM.checkRole(GOVERNOR, msg.sender);
        _;
    }

    // constructor
    constructor(address _acm) UnderACM(_acm) {
        _disableInitializers();
    }

    // initializer
    /// @dev initialize the contract and set the max liquidation incentive multiplier
    /// @param _maxLiqIncentiveMultiplier_e18 max liquidation incentive multiplier in 1e18
    function initialize(uint _maxLiqIncentiveMultiplier_e18) external initializer {
        _setMaxLiqIncentiveMultiplier_e18(_maxLiqIncentiveMultiplier_e18);
    }

    // functions
    /// @inheritdoc ILiqIncentiveCalculator
    /// @dev incentive multiplier = ((1 / health factor ) - 1) * (mode incentive multiplier) * max(repay token multiplier, coll token multiplier)
    function getLiqIncentiveMultiplier_e18(
        uint16 _mode,
        uint _healthFactor_e18,
        address _repayToken,
        address _collToken
    ) external view returns (uint multiplier_e18) {
        // if healthy, no extra incentive
        if (_healthFactor_e18 >= ONE_E18) return ONE_E18;
        if (_healthFactor_e18 == 0) return 0;
        
        uint maxTokenLiqIncentiveMultiplier_e18 =
            Math.max(tokenLiqIncentiveMultiplier_e18[_repayToken], tokenLiqIncentiveMultiplier_e18[_collToken]);

        uint incentive_e18 = (ONE_E18 * ONE_E18) / _healthFactor_e18 - ONE_E18;
        incentive_e18 = (incentive_e18 * (modeLiqIncentiveMultiplier_e18[_mode] * maxTokenLiqIncentiveMultiplier_e18))
            / (ONE_E18 * ONE_E18);
        multiplier_e18 = Math.min(ONE_E18 + incentive_e18, maxLiqIncentiveMultiplier_e18); // cap multiplier at max multiplier
        multiplier_e18 = Math.max(multiplier_e18, minLiqIncentiveMultiplier_e18[_mode]); // cap multiplier at min multiplier
    }

    /// @inheritdoc ILiqIncentiveCalculator
    function setModeLiqIncentiveMultiplier_e18(uint16[] calldata _modes, uint[] calldata _multipliers_e18)
        external
        onlyGovernor
    {
        _require(_modes.length == _multipliers_e18.length, Errors.ARRAY_LENGTH_MISMATCHED);
        for (uint i; i < _modes.length; i = i.uinc()) {
            modeLiqIncentiveMultiplier_e18[_modes[i]] = _multipliers_e18[i];
        }

        emit SetModeLiqIncentiveMultiplier_e18(_modes, _multipliers_e18);
    }

    /// @inheritdoc ILiqIncentiveCalculator
    function setTokenLiqIncentiveMultiplier_e18(address[] calldata _tokens, uint[] calldata _multipliers_e18)
        external
        onlyGovernor
    {
        _require(_tokens.length == _multipliers_e18.length, Errors.ARRAY_LENGTH_MISMATCHED);
        for (uint i; i < _tokens.length; i = i.uinc()) {
            tokenLiqIncentiveMultiplier_e18[_tokens[i]] = _multipliers_e18[i];
        }

        emit SetTokenLiqIncentiveMultiplier_e18(_tokens, _multipliers_e18);
    }

    /// @inheritdoc ILiqIncentiveCalculator
    function setMaxLiqIncentiveMultiplier_e18(uint _maxLiqIncentiveMultiplier_e18) external onlyGovernor {
        _setMaxLiqIncentiveMultiplier_e18(_maxLiqIncentiveMultiplier_e18);
    }

    /// @inheritdoc ILiqIncentiveCalculator
    function setMinLiqIncentiveMultiplier_e18(uint16[] calldata _modes, uint[] calldata _minMultipliers_e18)
        external
        onlyGovernor
    {
        _require(_modes.length == _minMultipliers_e18.length, Errors.ARRAY_LENGTH_MISMATCHED);
        for (uint i; i < _modes.length; i = i.uinc()) {
            minLiqIncentiveMultiplier_e18[_modes[i]] = _minMultipliers_e18[i];
        }

        emit SetMinLiqIncentiveMultiplier_e18(_modes, _minMultipliers_e18);
    }

    /// @dev set max liquidation incentive multiplier
    function _setMaxLiqIncentiveMultiplier_e18(uint _maxLiqIncentiveMultiplier_e18) internal {
        maxLiqIncentiveMultiplier_e18 = _maxLiqIncentiveMultiplier_e18;
        emit SetMaxLiqIncentiveMultiplier_e18(_maxLiqIncentiveMultiplier_e18);
    }
}
