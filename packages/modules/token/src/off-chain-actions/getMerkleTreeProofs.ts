import { z } from 'zod'

import { Address } from 'viem'

import { OffChainAction, OffChainActionCallback, OffChainActionReturn } from '@infinit-xyz/core'
import { validateZodObject, zodAddress } from '@infinit-xyz/core/internal'

import { MerkleTreeProofs, TokenRegistry } from '@/src/type'
import { MerkleTree } from '@utils/merkleTree'

enum Step {
  VALIDATE_DATA = 1,
  GENERATE_MERKLE_TREE_PROOFS = 2,
}

const TOTAL_STEP = Object.keys(Step).length / 2

export const GetMerkleTreeProofsOffChainActionParamsSchema = z.object({
  userRewardMapping: z.record(zodAddress, z.string()),
})

export type GetMerkleTreeProofsOffChainActionParams = z.infer<typeof GetMerkleTreeProofsOffChainActionParamsSchema>

export class GetMerkleTreeProofsOffChainAction extends OffChainAction<
  TokenRegistry,
  GetMerkleTreeProofsOffChainActionParams,
  MerkleTreeProofs
> {
  constructor() {
    super()
    this.name = GetMerkleTreeProofsOffChainAction.name
  }

  public override async run(
    _registry: TokenRegistry, // unused
    params: GetMerkleTreeProofsOffChainActionParams,
    callback?: OffChainActionCallback,
  ): Promise<OffChainActionReturn<MerkleTreeProofs>> {
    callback?.('start', { message: 'Get Merkle Tree Proofs' })

    callback?.('progress', { currentStep: Step.VALIDATE_DATA, totalSteps: TOTAL_STEP, message: 'Validating data' })

    validateZodObject(params, GetMerkleTreeProofsOffChainActionParamsSchema)

    callback?.('progress', {
      currentStep: Step.GENERATE_MERKLE_TREE_PROOFS,
      totalSteps: TOTAL_STEP,
      message: 'Generating Merkle Tree Proofs',
    })

    const merkleTree = new MerkleTree(params.userRewardMapping as Record<Address, string>)

    const root = merkleTree.getRoot()
    const proofs = merkleTree.getAllProofs()

    const merkleProofs: MerkleTreeProofs = {
      root: root,
      proofs: proofs,
    }

    callback?.('finish')

    return { message: 'Generate Merkle Tree Proofs Successfully', data: merkleProofs }
  }
}
