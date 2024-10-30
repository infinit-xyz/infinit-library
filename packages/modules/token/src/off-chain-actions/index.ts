import { InfinitOffChainActionRecord } from '@infinit-xyz/core'

import { GetMerkleTreeProofsOffChainAction, GetMerkleTreeProofsOffChainActionParamsSchema } from '@offChainActions/getMerkleTreeProofs'

export const offChainActions = {
  getProofMerkleTree: {
    name: 'Get Merkle Tree Proofs',
    offChainActionClassName: GetMerkleTreeProofsOffChainAction.name,
    paramsSchema: GetMerkleTreeProofsOffChainActionParamsSchema,
  },
} satisfies InfinitOffChainActionRecord

export { GetMerkleTreeProofsOffChainAction }
