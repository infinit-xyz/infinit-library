import { ActionDetailRecord } from '@infinit-xyz/core'

import { GetMerkleTreeProofsOffChainAction, GetMerkleTreeProofsOffChainActionParamsSchema } from '@actions/off-chain/getMerkleTreeProofs'
import { DeployInfinitERC20Action, DeployInfinitERC20ActionParamsSchema } from '@actions/on-chain/deployInfinitERC20'
import {
  DeployInfinitERC20BurnableAction,
  DeployInfinitERC20BurnableActionParamsSchema,
} from '@actions/on-chain/deployInfinitERC20Burnable'
import { SetMerkleRootAction, SetMerkleRootActionParamsSchema } from '@actions/on-chain/setMerkleRoot'

import {
  DeployAccumulativeMerkleDistributorAction,
  DeployAccumulativeMerkleDistributorProxyActionParamsSchema,
} from './on-chain/deployAccumulativeMerkleDistributor'

export const actions = {
  init: {
    type: 'on-chain',
    name: 'Deploy ERC20 Token',
    actionClassName: DeployInfinitERC20Action.name,
    paramsSchema: DeployInfinitERC20ActionParamsSchema,
    signers: ['deployer'],
  },
  deployInfinitERC20Burnable: {
    type: 'on-chain',
    name: 'Deploy ERC20 (Burnable) Token',
    actionClassName: DeployInfinitERC20BurnableAction.name,
    paramsSchema: DeployInfinitERC20BurnableActionParamsSchema,
    signers: ['deployer'],
  },
  deployAccumulativeMerkleDistributorAction: {
    type: 'on-chain',
    name: 'Deploy Accumulative Merkle Distributor',
    actionClassName: DeployAccumulativeMerkleDistributorAction.name,
    paramsSchema: DeployAccumulativeMerkleDistributorProxyActionParamsSchema,
    signers: ['deployer'],
  },
  setMerkleRootAction: {
    type: 'on-chain',
    name: 'Set Merkle Root',
    actionClassName: SetMerkleRootAction.name,
    paramsSchema: SetMerkleRootActionParamsSchema,
    signers: ['owner'],
  },
  getProofMerkleTree: {
    type: 'off-chain',
    name: 'Get Merkle Tree Proofs',
    actionClassName: GetMerkleTreeProofsOffChainAction.name,
    paramsSchema: GetMerkleTreeProofsOffChainActionParamsSchema,
  },
} satisfies ActionDetailRecord

export {
  DeployAccumulativeMerkleDistributorAction,
  DeployInfinitERC20Action,
  DeployInfinitERC20BurnableAction,
  GetMerkleTreeProofsOffChainAction,
  SetMerkleRootAction,
}
