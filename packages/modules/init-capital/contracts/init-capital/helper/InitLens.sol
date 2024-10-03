// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../common/library/UncheckedIncrement.sol';
import '../common/library/InitErrors.sol';

import {Math} from '@openzeppelin-contracts/utils/math/Math.sol';

import {IInitLens, PosInfo} from '../interfaces/helper/IInitLens.sol';
import {IHook} from '../interfaces/hook/IHook.sol';
import {IInitCore} from '../interfaces/core/IInitCore.sol';
import {IPosManager} from '../interfaces/core/IPosManager.sol';
import {IRiskManager} from '../interfaces/risk_manager/IRiskManager.sol';
import {ILendingPool} from '../interfaces/lending_pool/ILendingPool.sol';
import {IConfig, PoolConfig} from '../interfaces/core/IConfig.sol';
import {IERC721} from '@openzeppelin-contracts/token/ERC721/IERC721.sol';

contract InitLens is IInitLens {
    using UncheckedIncrement for uint;

    // immutables
    address public immutable CORE;
    address public immutable CONFIG;
    address public immutable POS_MANAGER;
    address public immutable RISK_MANAGER;

    // constructor
    constructor(address _core, address _pos_manager, address _risk_manager, address _config) {
        CORE = _core;
        CONFIG = _config;
        POS_MANAGER = _pos_manager;
        RISK_MANAGER = _risk_manager;
    }

    /// @inheritdoc IInitLens
    function getHookPosInfo(address _hook, address _user, uint _posId) external returns (PosInfo memory posInfo) {
        uint initPosId = IHook(_hook).initPosIds(_user, _posId);
        posInfo = _getPosInfo(initPosId);
    }

    /// @inheritdoc IInitLens
    function getHookPosInfos(address _hook, address _user, uint[] calldata _posIds)
        external
        returns (PosInfo[] memory posInfos)
    {
        uint length = _posIds.length;
        posInfos = new PosInfo[](length);
        for (uint i; i < length; i = i.uinc()) {
            uint initPosId = IHook(_hook).initPosIds(_user, _posIds[i]);
            posInfos[i] = _getPosInfo(initPosId);
        }
    }

    /// @inheritdoc IInitLens
    function getInitPosInfo(uint _initPosId) external returns (PosInfo memory posInfo) {
        posInfo = _getPosInfo(_initPosId);
    }

    /// @inheritdoc IInitLens
    function getInitPosInfos(uint[] calldata _initPosIds) external returns (PosInfo[] memory posInfos) {
        uint length = _initPosIds.length;
        posInfos = new PosInfo[](length);
        for (uint i; i < length; i = i.uinc()) {
            posInfos[i] = _getPosInfo(_initPosIds[i]);
        }
    }

    /// @inheritdoc IInitLens
    function modeBorrowableAmt(uint16 _mode, address _pool) public returns (uint borrowableAmt) {
        PoolConfig memory poolConfig = IConfig(CONFIG).getPoolConfig(_pool);
        // check if allow for borrow
        if (!poolConfig.canBorrow || !IConfig(CONFIG).getModeStatus(_mode).canBorrow) {
            return 0;
        }

        // get mode's pool debt ceil and mode's pool current debt
        uint modeDebtCeil = IRiskManager(RISK_MANAGER).getModeDebtCeilingAmt(_mode, _pool);
        uint modeCurrentDebt = IRiskManager(RISK_MANAGER).getModeDebtAmtCurrent(_mode, _pool);

        // get pool borr cap and pool total debt
        uint poolBorrCap = poolConfig.borrowCap;
        uint poolTotalDebt = ILendingPool(_pool).totalDebt();

        // return the least value of
        // poolCash,
        // mode's pool debt ceiling - mode's pool current debt,
        // pool's borrowcap - pool's total debt
        uint availableBorrCap = poolBorrCap > poolTotalDebt ? poolBorrCap - poolTotalDebt : 0;
        uint availableModeDebtCeil = modeDebtCeil > modeCurrentDebt ? modeDebtCeil - modeCurrentDebt : 0;
        borrowableAmt = Math.min(ILendingPool(_pool).cash(), Math.min(availableBorrCap, availableModeDebtCeil));
    }

    /// @inheritdoc IInitLens
    function posBorrowableAmt(address _hook, address _user, uint _posId, address _pool)
        external
        returns (uint borrowableAmt)
    {
        uint initPosId = IHook(_hook).initPosIds(_user, _posId);
        (, uint16 mode) = IPosManager(POS_MANAGER).getPosInfo(initPosId);
        borrowableAmt = modeBorrowableAmt(mode, _pool);
    }

    /// @inheritdoc IInitLens
    function viewerPosInfoAt(address _viewer, uint _index) public returns (PosInfo memory posInfo) {
        uint initPosId = IPosManager(POS_MANAGER).getViewerPosIdsAt(_viewer, _index);
        posInfo = _getPosInfo(initPosId);
    }

    /// @inheritdoc IInitLens
    function viewerPosInfos(address _viewer, uint[] calldata _indices) external returns (PosInfo[] memory posInfo) {
        uint length = _indices.length;
        posInfo = new PosInfo[](length);
        for (uint i; i < length; i = i.uinc()) {
            posInfo[i] = viewerPosInfoAt(_viewer, _indices[i]);
        }
    }

    // internal functions
    function _getPosInfo(uint _initPosId) internal returns (PosInfo memory posInfo) {
        _require(_initPosId != 0, Errors.ZERO_VALUE);
        // get position info
        (posInfo.viewer, posInfo.mode) = IPosManager(POS_MANAGER).getPosInfo(_initPosId);
        posInfo.owner = IERC721(POS_MANAGER).ownerOf(_initPosId);
        posInfo.health_e18 = IInitCore(CORE).getPosHealthCurrent_e18(_initPosId);
        posInfo.collCredit_e36 = IInitCore(CORE).getCollateralCreditCurrent_e36(_initPosId);
        posInfo.borrCredit_e36 = IInitCore(CORE).getBorrowCreditCurrent_e36(_initPosId);
        posInfo.health_e18 = IInitCore(CORE).getPosHealthCurrent_e18(_initPosId);
        // get position collateral info
        (
            posInfo.collInfo.pools,
            posInfo.collInfo.shares,
            posInfo.collInfo.wLps,
            posInfo.collInfo.ids,
            posInfo.collInfo.wLpAmts
        ) = IPosManager(POS_MANAGER).getPosCollInfo(_initPosId);
        posInfo.collInfo.amts = new uint[](posInfo.collInfo.pools.length);
        for (uint i; i < posInfo.collInfo.pools.length; i = i.uinc()) {
            posInfo.collInfo.amts[i] = ILendingPool(posInfo.collInfo.pools[i]).toAmtCurrent(posInfo.collInfo.shares[i]);
        }
        // get position borrow info
        (posInfo.borrInfo.pools, posInfo.borrInfo.debtShares) = IPosManager(POS_MANAGER).getPosBorrInfo(_initPosId);
        posInfo.borrInfo.debts = new uint[](posInfo.borrInfo.pools.length);
        for (uint i; i < posInfo.borrInfo.pools.length; i = i.uinc()) {
            posInfo.borrInfo.debts[i] =
                ILendingPool(posInfo.borrInfo.pools[i]).debtShareToAmtCurrent(posInfo.borrInfo.debtShares[i]);
        }
        posInfo.posId = _initPosId;
    }
}
