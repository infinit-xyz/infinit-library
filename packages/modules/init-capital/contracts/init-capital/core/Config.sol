// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../common/library/InitErrors.sol';
import '../common/library/ArrayLib.sol';

import {
    TokenFactors, IConfig, ModeConfig, ModeStatus, PoolConfig, EnumerableSet
} from '../interfaces/core/IConfig.sol';
import {UnderACM} from '../common/UnderACM.sol';

import {Initializable} from '@openzeppelin-contracts-upgradeable/proxy/utils/Initializable.sol';

contract Config is IConfig, UnderACM, Initializable {
    using EnumerableSet for EnumerableSet.AddressSet;
    using UncheckedIncrement for uint;

    // constants
    uint private constant ONE_E18 = 1e18;
    bytes32 private constant GUARDIAN = keccak256('guardian');
    bytes32 private constant GOVERNOR = keccak256('governor');

    // storages
    mapping(address => bool) public whitelistedWLps; // @inheritdoc IConfig
    mapping(address => PoolConfig) private __poolConfigs;
    mapping(uint16 => ModeConfig) private __modeConfigs;

    // modifiers
    modifier onlyGuardian() {
        ACM.checkRole(GUARDIAN, msg.sender);
        _;
    }

    modifier onlyGovernor() {
        ACM.checkRole(GOVERNOR, msg.sender);
        _;
    }

    // constructor
    constructor(address _acm) UnderACM(_acm) {
        _disableInitializers();
    }

    // initializer
    /// @dev initialize the contract
    function initialize() external initializer {}

    // functions
    /// @inheritdoc IConfig
    function getModeConfig(uint16 _mode)
        external
        view
        returns (
            address[] memory collTokens,
            address[] memory borrTokens,
            uint maxHealthAfterLiq_e18,
            uint8 maxCollWLpCount
        )
    {
        collTokens = __modeConfigs[_mode].collTokens.values();
        borrTokens = __modeConfigs[_mode].borrTokens.values();
        maxHealthAfterLiq_e18 = __modeConfigs[_mode].maxHealthAfterLiq_e18;
        maxCollWLpCount = __modeConfigs[_mode].maxCollWLpCount;
    }

    /// @inheritdoc IConfig
    function getPoolConfig(address _pool) external view returns (PoolConfig memory config) {
        config = __poolConfigs[_pool];
    }

    /// @inheritdoc IConfig
    function isAllowedForBorrow(uint16 _mode, address _pool) external view returns (bool flag) {
        flag = __modeConfigs[_mode].borrTokens.contains(_pool);
    }

    /// @inheritdoc IConfig
    function isAllowedForCollateral(uint16 _mode, address _pool) external view returns (bool flag) {
        flag = __modeConfigs[_mode].collTokens.contains(_pool);
    }

    /// @inheritdoc IConfig
    function getTokenFactors(uint16 _mode, address _pool) external view returns (TokenFactors memory factors) {
        factors = __modeConfigs[_mode].factors[_pool];
    }

    function getMaxHealthAfterLiq_e18(uint16 _mode) external view returns (uint maxHealthAfterLiq_e18) {
        maxHealthAfterLiq_e18 = __modeConfigs[_mode].maxHealthAfterLiq_e18;
    }

    /// @inheritdoc IConfig
    function getModeStatus(uint16 _mode) external view returns (ModeStatus memory modeStatus) {
        modeStatus = __modeConfigs[_mode].status;
    }

    /// @inheritdoc IConfig
    function setPoolConfig(address _pool, PoolConfig calldata _config) external onlyGuardian {
        __poolConfigs[_pool] = _config;
        emit SetPoolConfig(_pool, _config);
    }

    /// @inheritdoc IConfig
    function setCollFactors_e18(uint16 _mode, address[] calldata _pools, uint128[] calldata _factors_e18)
        external
        onlyGovernor
    {
        _require(_mode != 0, Errors.INVALID_MODE);
        _require(_pools.length == _factors_e18.length, Errors.ARRAY_LENGTH_MISMATCHED);
        _require(AddressArrayLib.isSortedAndNotDuplicate(_pools), Errors.NOT_SORTED_OR_DUPLICATED_INPUT);
        EnumerableSet.AddressSet storage collTokens = __modeConfigs[_mode].collTokens;
        for (uint i; i < _pools.length; i = i.uinc()) {
            _require(_factors_e18[i] <= ONE_E18, Errors.INVALID_FACTOR);
            collTokens.add(_pools[i]);
            __modeConfigs[_mode].factors[_pools[i]].collFactor_e18 = _factors_e18[i];
        }
        emit SetCollFactors_e18(_mode, _pools, _factors_e18);
    }

    /// @inheritdoc IConfig
    function setBorrFactors_e18(uint16 _mode, address[] calldata _pools, uint128[] calldata _factors_e18)
        external
        onlyGovernor
    {
        _require(_mode != 0, Errors.INVALID_MODE);
        _require(_pools.length == _factors_e18.length, Errors.ARRAY_LENGTH_MISMATCHED);
        _require(AddressArrayLib.isSortedAndNotDuplicate(_pools), Errors.NOT_SORTED_OR_DUPLICATED_INPUT);
        EnumerableSet.AddressSet storage borrTokens = __modeConfigs[_mode].borrTokens;
        for (uint i; i < _pools.length; i = i.uinc()) {
            borrTokens.add(_pools[i]);
            _require(_factors_e18[i] >= ONE_E18, Errors.INVALID_FACTOR);
            __modeConfigs[_mode].factors[_pools[i]].borrFactor_e18 = _factors_e18[i];
        }
        emit SetBorrFactors_e18(_mode, _pools, _factors_e18);
    }

    /// @inheritdoc IConfig
    function setModeStatus(uint16 _mode, ModeStatus calldata _status) external onlyGuardian {
        _require(_mode != 0, Errors.INVALID_MODE);
        __modeConfigs[_mode].status = _status;
        emit SetModeStatus(_mode, _status);
    }

    /// @inheritdoc IConfig
    function setMaxHealthAfterLiq_e18(uint16 _mode, uint64 _maxHealthAfterLiq_e18) external onlyGuardian {
        _require(_mode != 0, Errors.INVALID_MODE);
        _require(_maxHealthAfterLiq_e18 > ONE_E18, Errors.INPUT_TOO_LOW);
        __modeConfigs[_mode].maxHealthAfterLiq_e18 = _maxHealthAfterLiq_e18;
        emit SetMaxHealthAfterLiq_e18(_mode, _maxHealthAfterLiq_e18);
    }

    /// @inheritdoc IConfig
    function setMaxCollWLpCount(uint16 _mode, uint8 _maxCollWLpCount) external onlyGuardian {
        _require(_mode != 0, Errors.INVALID_MODE);
        __modeConfigs[_mode].maxCollWLpCount = _maxCollWLpCount;
        emit SetMaxCollWLpCount(_mode, _maxCollWLpCount);
    }

    /// @inheritdoc IConfig
    function setWhitelistedWLps(address[] calldata _wLps, bool _status) external onlyGovernor {
        for (uint i; i < _wLps.length; i = i.uinc()) {
            whitelistedWLps[_wLps[i]] = _status;
        }
        emit SetWhitelistedWLps(_wLps, _status);
    }

    function getModeMaxCollWLpCount(uint16 _mode) external view returns (uint8) {
        return __modeConfigs[_mode].maxCollWLpCount;
    }
}
