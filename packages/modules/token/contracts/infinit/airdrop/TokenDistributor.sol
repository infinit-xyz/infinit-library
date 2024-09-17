// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

import './SweepTokenOwnable.sol';

contract TokenDistributor is SweepTokenOwnable {
  using SafeERC20 for IERC20;

  // immutable
  address public immutable token;

  // storage
  mapping(address => uint256) public totalAccruedAmounts;
  mapping(address => uint256) public claimedAmounts;

  // events
  event Claimed(address indexed recipient, uint256 amount);
  event TotalAccruedAmountUpdated(address indexed recipient, uint256 amount);
  event Deposited(uint256 amount);

  /// @param _owner owner address
  /// @param _token token address
  constructor(address _owner, address _token) SweepTokenOwnable(_owner) {
    token = _token;
  }

  /// @notice user claims their tokens
  /// @return amount claimed amount
  function claim() external virtual returns (uint256 amount) {
    uint256 totalAccruedAmount = totalAccruedAmounts[msg.sender];
    uint256 claimedAmount = claimedAmounts[msg.sender];
    amount = totalAccruedAmount - claimedAmount;

    require(amount > 0, 'No tokens to claim');
    claimedAmounts[msg.sender] = totalAccruedAmount;

    // Transfer tokens
    IERC20(token).safeTransfer(msg.sender, amount);
    emit Claimed(msg.sender, amount);
  }

  /// @notice owner deposits token
  /// @param amount amount to deposit
  function deposit(uint256 amount) external virtual onlyOwner {
    IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    emit Deposited(amount);
  }

  /// @notice owner updates total accrued amounts
  /// @param recipients array of recipients
  /// @param newTotalAccruedAmounts array of total token amounts user can claim
  function updateTotalAccruedAmounts(address[] calldata recipients, uint256[] calldata newTotalAccruedAmounts) external virtual onlyOwner {
    require(recipients.length == newTotalAccruedAmounts.length, 'Invalid lengths');
    for (uint256 i; i < recipients.length; ++i) {
      totalAccruedAmounts[recipients[i]] = newTotalAccruedAmounts[i];
      emit TotalAccruedAmountUpdated(recipients[i], newTotalAccruedAmounts[i]);
    }
  }
}
