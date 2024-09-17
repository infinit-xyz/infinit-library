import { z } from 'zod'

import { Address } from 'viem'

import { Action, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError, ValueNotFoundError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { TokenRegistry } from '@/src/type'
import { MerkleTree } from '@utils/merkleTree'

export const GetProofMerkleTreeActionParamsSchema = z.object({
  userRewardMapping: z.record(zodAddress, z.string()),
  userAddress: zodAddress,
})

export type GetProofMerkleTreeActionParams = z.infer<typeof GetProofMerkleTreeActionParamsSchema>

export type GetProofMerkleTreeActionData = {
  params: GetProofMerkleTreeActionParams
  signer: {}
}

export class GetProofMerkleTreeAction extends Action<GetProofMerkleTreeActionData, TokenRegistry> {
  constructor(data: GetProofMerkleTreeActionData) {
    validateActionData(data, GetProofMerkleTreeActionParamsSchema, [])
    super(GetProofMerkleTreeAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    return []
  }

  public override async run(registry: TokenRegistry): Promise<TokenRegistry> {
    const params = this.data.params

    // validate the action data
    const userRewardAmount = params.userRewardMapping[params.userAddress]
    if (userRewardAmount === undefined) {
      throw new ValueNotFoundError(`${params.userAddress} not found in the reward list`)
    }
    if (Number(userRewardAmount) === 0) {
      throw new ValidateInputValueError(`Reward of ${params.userAddress} is 0`)
    }

    const merkleTree = new MerkleTree(params.userRewardMapping as Record<Address, string>)
    const proofDetail = merkleTree.getProof(params.userAddress)
    const root = merkleTree.getRoot()

    const newRegistry: TokenRegistry = {
      ...registry,
      merkleTree: {
        ...registry.merkleTree,
        root,
        merkle: {
          ...registry.merkleTree?.merkle,
          [params.userAddress]: proofDetail,
        },
      },
    }

    return newRegistry
  }
}
