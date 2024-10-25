import { Address, Hex, encodePacked, keccak256 } from 'viem'

import { ValidateInputValueError, ValueNotFoundError } from '@infinit-xyz/core/errors'

import { ProofDetail } from '@/src/type'
import { SimpleMerkleTree } from '@openzeppelin/merkle-tree'

export class MerkleTree {
  private tree: SimpleMerkleTree
  private userRewardMapping: Record<Address, string>

  constructor(userRewardMapping: Record<Address, string>) {
    this.userRewardMapping = userRewardMapping
    this.tree = this.generateTree()
  }

  private validateUserRewardMapping() {
    Object.entries(this.userRewardMapping).forEach(([userAddress, reward]) => {
      if (BigInt(reward) === BigInt(0)) {
        throw new ValidateInputValueError(`${userAddress} has 0 reward`)
      }
    })
  }

  private generateTree() {
    this.validateUserRewardMapping()

    const leaves = Object.entries(this.userRewardMapping).map(([userAddress, reward]) =>
      keccak256(encodePacked(['address', 'uint256'], [userAddress as Hex, BigInt(reward)])),
    )

    const tree = SimpleMerkleTree.of(leaves)
    return tree
  }

  public getProof(userAddress: Address): ProofDetail {
    const userRewardAmount = this.userRewardMapping[userAddress]
    if (userRewardAmount === undefined) {
      throw new ValueNotFoundError(`${userAddress} not found in the reward list`)
    }

    const proof = this.tree.getProof(keccak256(encodePacked(['address', 'uint256'], [userAddress, BigInt(userRewardAmount)]))) as Hex[]

    return { proof, amount: userRewardAmount }
  }

  public getRoot(): Hex {
    return this.tree.root as Hex
  }

  public getAllProofs(): Record<Address, ProofDetail> {
    return Object.entries(this.userRewardMapping).reduce(
      (acc, [_userAddress]) => {
        const userAddress = _userAddress as Address
        const proofDetail = this.getProof(userAddress)
        acc[userAddress] = proofDetail
        return acc
      },
      {} as Record<Address, ProofDetail>,
    )
  }
}
