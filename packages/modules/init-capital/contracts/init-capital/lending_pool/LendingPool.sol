// SPDX-License-Identifier: None
pragma solidity ^0.8.19;

import '../common/library/InitErrors.sol';
import {UnderACM} from '../common/UnderACM.sol';
import {ILendingPool} from '../interfaces/lending_pool/ILendingPool.sol';
import {IIRM} from '../interfaces/lending_pool/IIRM.sol';

import {ERC20Upgradeable} from '@openzeppelin-contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import {IERC20Metadata} from '@openzeppelin-contracts/token/ERC20/extensions/IERC20Metadata.sol';
import {SafeERC20} from '@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin-contracts/token/ERC20/IERC20.sol';
import {MathUpgradeable} from '@openzeppelin-contracts-upgradeable/utils/math/MathUpgradeable.sol';

contract LendingPool is ERC20Upgradeable, ILendingPool, UnderACM {
    using SafeERC20 for IERC20;
    using MathUpgradeable for uint;

    // constants
    uint private constant ONE_E18 = 1e18;
    uint8 private constant VIRTUAL_SHARE_DECIMALS = 8;
    uint private constant VIRTUAL_SHARES = 10 ** VIRTUAL_SHARE_DECIMALS;
    uint private constant VIRTUAL_ASSETS = 1;
    bytes32 private constant GUARDIAN = keccak256('guardian');
    bytes32 private constant GOVERNOR = keccak256('governor');

    // immutables
    address public immutable core;

    // storages
    address public underlyingToken; // underlying tokens
    uint public cash; // total cash
    uint public totalDebt; // total debt
    uint public totalDebtShares; // total debt shares
    address public irm; // interest rate model
    uint public lastAccruedTime; // last accrued timestamp
    uint public reserveFactor_e18; // reserve factor
    address public treasury; // treasury address

    // modifiers
    modifier onlyGuardian() {
        ACM.checkRole(GUARDIAN, msg.sender);
        _;
    }

    modifier onlyGovernor() {
        ACM.checkRole(GOVERNOR, msg.sender);
        _;
    }

    modifier onlyCore() {
        _require(msg.sender == core, Errors.NOT_INIT_CORE);
        _;
    }

    modifier accrue() {
        accrueInterest();
        _;
    }

    // constructor
    constructor(address _core, address _acm) UnderACM(_acm) {
        _disableInitializers();
        core = _core;
    }

    // initializer
    /// @dev initialize contract and setup underlying token, name, symbol
    ///     interest rate model, reserver factor and treasury
    /// @param _underlyingToken underlying token address
    /// @param _name lending pool's name
    /// @param _symbol lending pool's symbol
    /// @param _irm interest rate model address
    /// @param _reserveFactor_e18 reserve factor in 1e18 (1e18 = 100%)
    /// @param _treasury treasury address
    function initialize(
        address _underlyingToken,
        string calldata _name,
        string calldata _symbol,
        address _irm,
        uint _reserveFactor_e18,
        address _treasury
    ) external initializer {
        underlyingToken = _underlyingToken;
        __ERC20_init(_name, _symbol);
        irm = _irm;
        treasury = _treasury;
        lastAccruedTime = block.timestamp;
        reserveFactor_e18 = _reserveFactor_e18;
        // approve core to enable flashloan
        IERC20(_underlyingToken).safeApprove(core, type(uint).max);
    }

    // functions
    /// @inheritdoc ERC20Upgradeable
    function decimals() public view override returns (uint8) {
        return IERC20Metadata(underlyingToken).decimals() + VIRTUAL_SHARE_DECIMALS;
    }

    /// @inheritdoc ILendingPool
    function mint(address _receiver) external onlyCore accrue returns (uint shares) {
        uint _cash = cash;
        uint newCash = IERC20(underlyingToken).balanceOf(address(this));
        uint amt = newCash - _cash;
        shares = _toShares(amt, _cash + totalDebt, totalSupply());
        _require(shares != 0, Errors.ZERO_VALUE);
        _mint(_receiver, shares);
        cash = newCash;
    }

    /// @inheritdoc ILendingPool
    function burn(address _receiver) external onlyCore accrue returns (uint amt) {
        uint sharesToBurn = balanceOf(address(this));
        uint _cash = cash;
        _require(sharesToBurn != 0, Errors.ZERO_VALUE);
        amt = _toAmt(sharesToBurn, _cash + totalDebt, totalSupply());
        _require(amt <= _cash, Errors.NOT_ENOUGH_CASH);
        unchecked {
            cash = _cash - amt;
        }
        _burn(address(this), sharesToBurn);
        IERC20(underlyingToken).safeTransfer(_receiver, amt);
    }

    /// @inheritdoc ILendingPool
    function borrow(address _receiver, uint _amt) external onlyCore accrue returns (uint shares) {
        _require(_amt <= cash, Errors.NOT_ENOUGH_CASH);
        uint _totalDebt = totalDebt;
        shares = _totalDebt > 0 ? _amt.mulDiv(totalDebtShares, _totalDebt, MathUpgradeable.Rounding.Up) : _amt;
        totalDebtShares += shares;
        totalDebt = _totalDebt + _amt;
        unchecked {
            cash -= _amt;
        }
        IERC20(underlyingToken).safeTransfer(_receiver, _amt);
    }

    /// @inheritdoc ILendingPool
    function repay(uint _shares) external onlyCore accrue returns (uint amt) {
        uint _totalDebtShares = totalDebtShares;
        uint _totalDebt = totalDebt;
        uint _cash = cash;
        amt = _shares.mulDiv(_totalDebt, _totalDebtShares, MathUpgradeable.Rounding.Up);
        _require(amt <= IERC20(underlyingToken).balanceOf(address(this)) - _cash, Errors.INVALID_AMOUNT_TO_REPAY);
        totalDebtShares = _totalDebtShares - _shares;
        totalDebt = _totalDebt > amt ? _totalDebt - amt : 0;
        cash = _cash + amt;
    }

    /// @inheritdoc ILendingPool
    function accrueInterest() public {
        uint _lastAccruedTime = lastAccruedTime;
        if (block.timestamp != _lastAccruedTime) {
            uint _totalDebt = totalDebt;
            uint _cash = cash;
            uint borrowRate_e18 = IIRM(irm).getBorrowRate_e18(_cash, _totalDebt);
            uint accruedInterest = (borrowRate_e18 * (block.timestamp - _lastAccruedTime) * _totalDebt) / ONE_E18;
            uint reserve = (accruedInterest * reserveFactor_e18) / ONE_E18;
            if (reserve > 0) {
                _mint(treasury, _toShares(reserve, _cash + _totalDebt + accruedInterest - reserve, totalSupply()));
            }
            totalDebt = _totalDebt + accruedInterest;
            lastAccruedTime = block.timestamp;
        }
    }

    /// @inheritdoc ILendingPool
    function debtAmtToShareStored(uint _amt) public view returns (uint shares) {
        shares = totalDebt > 0 ? _amt.mulDiv(totalDebtShares, totalDebt, MathUpgradeable.Rounding.Up) : _amt;
    }

    /// @inheritdoc ILendingPool
    function debtAmtToShareCurrent(uint _amt) external accrue returns (uint shares) {
        shares = debtAmtToShareStored(_amt);
    }

    /// @inheritdoc ILendingPool
    function debtShareToAmtStored(uint _shares) public view returns (uint amt) {
        amt = totalDebtShares > 0 ? _shares.mulDiv(totalDebt, totalDebtShares, MathUpgradeable.Rounding.Up) : 0;
    }

    /// @inheritdoc ILendingPool
    function debtShareToAmtCurrent(uint _shares) external accrue returns (uint amt) {
        amt = debtShareToAmtStored(_shares);
    }

    /// @inheritdoc ILendingPool
    function toShares(uint _amt) public view returns (uint shares) {
        shares = _toShares(_amt, totalAssets(), totalSupply());
    }

    /// @inheritdoc ILendingPool
    function toAmt(uint _shares) public view returns (uint amt) {
        amt = _toAmt(_shares, totalAssets(), totalSupply());
    }

    /// @inheritdoc ILendingPool
    function toSharesCurrent(uint _amt) external accrue returns (uint shares) {
        shares = toShares(_amt);
    }

    /// @inheritdoc ILendingPool
    function toAmtCurrent(uint _shares) external accrue returns (uint amt) {
        amt = toAmt(_shares);
    }

    /// @inheritdoc ILendingPool
    function getSupplyRate_e18() external view returns (uint supplyRate_e18) {
        uint _totalDebt = totalDebt;
        uint _cash = cash;
        uint borrowRate_e18 = IIRM(irm).getBorrowRate_e18(_cash, _totalDebt);
        // supply rate = borrow rate * (1 - reserve factor) * totalDebt / (cash + totalDebt)
        supplyRate_e18 = _cash + _totalDebt > 0
            ? (borrowRate_e18 * (ONE_E18 - reserveFactor_e18) * _totalDebt) / ((_cash + _totalDebt) * ONE_E18)
            : 0;
    }

    /// @inheritdoc ILendingPool
    function getBorrowRate_e18() external view returns (uint borrowRate_e18) {
        borrowRate_e18 = IIRM(irm).getBorrowRate_e18(cash, totalDebt);
    }

    /// @inheritdoc ILendingPool
    function totalAssets() public view returns (uint) {
        return cash + totalDebt;
    }

    /// @inheritdoc ILendingPool
    function setIrm(address _irm) external accrue onlyGuardian {
        _require(_irm != address(0), Errors.ZERO_VALUE);
        irm = _irm;
        emit SetIrm(_irm);
    }

    /// @inheritdoc ILendingPool
    function setReserveFactor_e18(uint _reserveFactor_e18) external accrue onlyGuardian {
        _require(_reserveFactor_e18 <= ONE_E18, Errors.INPUT_TOO_HIGH);
        reserveFactor_e18 = _reserveFactor_e18;
        emit SetReserveFactor_e18(_reserveFactor_e18);
    }

    /// @inheritdoc ILendingPool
    function setTreasury(address _treasury) external accrue onlyGovernor {
        _require(_treasury != address(0), Errors.ZERO_VALUE);
        treasury = _treasury;
        emit SetTreasury(_treasury);
    }

    /// @dev This implementation mitigates share price manipulations, using OpenZeppelin's method of virtual shares:
    /// https://docs.openzeppelin.com/contracts/4.x/erc4626#inflation-attack.
    /// @param _amt The amount of assets to convert to shares.
    /// @param _totalAssets The total amount of assets in the pool.
    /// @param _totalShares The total amount of shares in the pool.
    /// @return shares the amount of shares
    function _toShares(uint _amt, uint _totalAssets, uint _totalShares) internal pure returns (uint shares) {
        return _amt.mulDiv(_totalShares + VIRTUAL_SHARES, _totalAssets + VIRTUAL_ASSETS);
    }

    /// @dev This implementation mitigates share price manipulations, using OpenZeppelin's method of virtual shares:
    /// https://docs.openzeppelin.com/contracts/4.x/erc4626#inflation-attack.
    /// @param _shares The amount of shares to convert to assets.
    /// @param _totalAssets The total amount of assets in the pool.
    /// @param _totalShares The total amount of shares in the pool.
    /// @return amt the token amount
    function _toAmt(uint _shares, uint _totalAssets, uint _totalShares) internal pure returns (uint amt) {
        return _shares.mulDiv(_totalAssets + VIRTUAL_ASSETS, _totalShares + VIRTUAL_SHARES);
    }
}
