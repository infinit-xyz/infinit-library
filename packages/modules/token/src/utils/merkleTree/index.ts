import { Address, Hex, encodePacked, keccak256 } from 'viem'

import { ValidateInputValueError, ValueNotFoundError } from '@infinit-xyz/core/errors'

import { SimpleMerkleTree } from '@openzeppelin/merkle-tree'
import { ProofDetail } from '@utils/merkleTree/type'

export class MerkleTree {
  private tree: SimpleMerkleTree
  private userRewardMapping: Record<Address, string>

  constructor(userRewardMapping: Record<Address, string>) {
    this.userRewardMapping = userRewardMapping
    this.tree = this.generateTree()
  }

  private generateTree() {
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
    if (Number(userRewardAmount) === 0) {
      throw new ValidateInputValueError(`Reward of ${userAddress} is 0`)
    }

    const proof = this.tree.getProof(keccak256(encodePacked(['address', 'uint256'], [userAddress, BigInt(userRewardAmount)]))) as Hex[]

    return { proof, amount: userRewardAmount }
  }

  public getRoot(): string {
    return this.tree.root
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
