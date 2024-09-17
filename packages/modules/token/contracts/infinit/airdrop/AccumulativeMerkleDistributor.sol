// SPDX-License-Identifier: GPL-3.0-or-later
// ref: https://github.com/pendle-finance/pendle-core-v2-public/blob/main/contracts/LiquidityMining/PendleMerkleDistributor.sol
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';
import '../libraries/BoringOwnableUpgradeable.sol';
import '../libraries/TokenHelper.sol';
import '../interfaces/IMerkleDistributor.sol';

contract AccumulativeMerkleDistributor is IMerkleDistributor, UUPSUpgradeable, BoringOwnableUpgradeable, TokenHelper {
  address public immutable token;

  bytes32 public merkleRoot;

  mapping(address => uint256) public claimed;
  mapping(address => uint256) public verified;

  constructor(address _token) initializer {
    token = _token;
  }

  receive() external payable {}

  /// @notice initialize the contract
  function initialize() external initializer {
    __BoringOwnable_init();
  }

  /// @notice claim tokens
  /// @param receiver receiver address
  /// @param totalAccrued total accrued amount
  /// @param proof merkle proof
  /// @return amountOut claimed amount
  function claim(address receiver, uint256 totalAccrued, bytes32[] calldata proof) external returns (uint256 amountOut) {
    address user = msg.sender;
    if (!_verifyMerkleData(user, totalAccrued, proof)) revert InvalidMerkleProof();

    amountOut = totalAccrued - claimed[user];
    claimed[user] = totalAccrued;

    _transferOut(token, receiver, amountOut);
    emit Claimed(user, receiver, amountOut);
  }

  /// @notice claim verified tokens
  /// @param receiver receiver address
  /// @return amountOut claimed amount
  function claimVerified(address receiver) external returns (uint256 amountOut) {
    address user = msg.sender;
    uint256 amountVerified = verified[user];
    uint256 amountClaimed = claimed[user];

    if (amountVerified <= amountClaimed) {
      return 0;
    }

    amountOut = amountVerified - amountClaimed;
    claimed[user] = amountVerified;

    _transferOut(token, receiver, amountOut);
    emit Claimed(user, receiver, amountOut);
  }

  /// @notice verify the merkle data so that the claimer doesn't need to send proof
  /// @param user user address
  /// @param totalAccrued total accrued amount
  /// @param proof merkle proof
  /// @return amountClaimable claimable amount
  function verify(address user, uint256 totalAccrued, bytes32[] calldata proof) external returns (uint256 amountClaimable) {
    if (!_verifyMerkleData(user, totalAccrued, proof)) revert InvalidMerkleProof();
    amountClaimable = totalAccrued - claimed[user];
    verified[user] = totalAccrued;

    emit Verified(user, amountClaimable);
  }

  /// @notice verify the merkle data
  /// @param user user address
  /// @param amount amount
  /// @param proof merkle proof
  /// @return valid whether the proof is valid
  function _verifyMerkleData(address user, uint256 amount, bytes32[] calldata proof) internal view returns (bool) {
    bytes32 leaf = keccak256(abi.encodePacked(user, amount));
    return MerkleProof.verify(proof, merkleRoot, leaf);
  }

  // ----------------- owner logic -----------------
  /// @notice set merkle root
  /// @param newMerkleRoot new merkle root
  function setMerkleRoot(bytes32 newMerkleRoot) external payable onlyOwner {
    merkleRoot = newMerkleRoot;
    emit SetMerkleRoot(merkleRoot);
  }

  // ----------------- upgrade-related -----------------

  function _authorizeUpgrade(address) internal override onlyOwner {}
}
