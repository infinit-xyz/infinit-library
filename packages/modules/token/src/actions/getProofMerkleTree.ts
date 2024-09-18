import { z } from 'zod'

import { Address, Hex } from 'viem'

import { Action, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { TokenRegistry } from '@/src/type'
import { MerkleTree } from '@utils/merkleTree'

export const GetProofMerkleTreeActionParamsSchema = z.object({
  userRewardMapping: z.record(zodAddress, z.string()),
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

    const merkleTree = new MerkleTree(params.userRewardMapping as Record<Address, string>)

    const merkleUserProofDetailMapping = Object.keys(params.userRewardMapping).reduce(
      (acc, _userAddress) => {
        const userAddress = _userAddress as Address
        const reward = params.userRewardMapping[userAddress]
        if (!reward || reward === '0') return acc

        return { ...acc, [userAddress]: merkleTree.getProof(userAddress) }
      },
      {} as Record<Address, { amount: string; proof: Hex[] }>,
    )

    const root = merkleTree.getRoot()

    // all user
    const newRegistry: TokenRegistry = {
      ...registry,
      merkleTree: {
        ...registry.merkleTree,
        root,
        merkle: {
          ...registry.merkleTree?.merkle,
          ...merkleUserProofDetailMapping,
        },
      },
    }

    return newRegistry
  }
}
