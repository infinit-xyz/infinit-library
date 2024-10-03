// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import {IRiskManager} from '../interfaces/risk_manager/IRiskManager.sol';
import {ILendingPool} from '../interfaces/lending_pool/ILendingPool.sol';
import '../common/library/InitErrors.sol';
import '../common/library/UncheckedIncrement.sol';
import {Initializable} from '@openzeppelin-contracts-upgradeable/proxy/utils/Initializable.sol';
import {SafeCast} from '@openzeppelin-contracts/utils/math/SafeCast.sol';
import {UnderACM} from '../common/UnderACM.sol';

contract RiskManager is IRiskManager, UnderACM, Initializable {
    using UncheckedIncrement for uint;
    using SafeCast for uint;
    using SafeCast for uint128;
    using SafeCast for int;

    // constants
    bytes32 private constant GUARDIAN = keccak256('guardian');

    // immutables
    address public immutable CORE; // core address

    // storages
    mapping(uint16 => mapping(address => DebtCeilingInfo)) private __modeDebtCeilingInfos;

    // modifiers
    modifier onlyGuardian() {
        ACM.checkRole(GUARDIAN, msg.sender);
        _;
    }

    modifier onlyCore() {
        _require(msg.sender == CORE, Errors.NOT_INIT_CORE);
        _;
    }

    // constructor
    constructor(address _core, address _acm) UnderACM(_acm) {
        CORE = _core;
        _disableInitializers();
    }

    // initializer
    /// @dev initialize contract
    function initialize() external initializer {}

    // functions
    /// @inheritdoc IRiskManager
    function getModeDebtShares(uint16 _mode, address _pool) external view returns (uint) {
        return __modeDebtCeilingInfos[_mode][_pool].debtShares;
    }

    /// @inheritdoc IRiskManager
    function getModeDebtAmtCurrent(uint16 _mode, address _pool) external returns (uint) {
        return ILendingPool(_pool).debtShareToAmtCurrent(__modeDebtCeilingInfos[_mode][_pool].debtShares);
    }

    /// @inheritdoc IRiskManager
    function getModeDebtAmtStored(uint16 _mode, address _pool) external view returns (uint) {
        return ILendingPool(_pool).debtShareToAmtStored(__modeDebtCeilingInfos[_mode][_pool].debtShares);
    }

    /// @inheritdoc IRiskManager
    function getModeDebtCeilingAmt(uint16 _mode, address _pool) external view returns (uint) {
        return __modeDebtCeilingInfos[_mode][_pool].ceilAmt;
    }

    /// @inheritdoc IRiskManager
    function updateModeDebtShares(uint16 _mode, address _pool, int _deltaShares) external onlyCore {
        DebtCeilingInfo memory debtCeilingInfo = __modeDebtCeilingInfos[_mode][_pool];
        uint newDebtShares = (debtCeilingInfo.debtShares.toInt256() + _deltaShares).toUint256();
        if (_deltaShares > 0) {
            uint currentDebt = ILendingPool(_pool).debtShareToAmtCurrent(newDebtShares);
            _require(currentDebt <= debtCeilingInfo.ceilAmt, Errors.DEBT_CEILING_EXCEEDED);
        }
        __modeDebtCeilingInfos[_mode][_pool].debtShares = newDebtShares.toUint128();
    }

    /// @inheritdoc IRiskManager
    function setModeDebtCeilingInfo(uint16 _mode, address[] calldata _pools, uint128[] calldata _ceilAmts)
        external
        onlyGuardian
    {
        _require(_pools.length == _ceilAmts.length, Errors.ARRAY_LENGTH_MISMATCHED);
        for (uint i; i < _pools.length; i = i.uinc()) {
            __modeDebtCeilingInfos[_mode][_pools[i]].ceilAmt = _ceilAmts[i];
            emit SetModeDebtCeilingInfo(_mode, _pools[i], _ceilAmts[i]);
        }
    }
}
