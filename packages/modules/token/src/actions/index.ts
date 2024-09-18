import { InfinitActionRecord } from '@infinit-xyz/core'

import { DeployInfinitERC20Action, DeployInfinitERC20ActionParamsSchema } from '@actions/deployInfinitERC20'
import { DeployInfinitERC20BurnableAction, DeployInfinitERC20BurnableActionParamsSchema } from '@actions/deployInfinitERC20Burnable'
import { GetProofMerkleTreeAction, GetProofMerkleTreeActionParamsSchema } from '@actions/getProofMerkleTree'
import { SetMerkleRootAction, SetMerkleRootActionParamsSchema } from '@actions/setMerkleRoot'

import {
  DeployAccumulativeMerkleDistributorAction,
  DeployAccumulativeMerkleDistributorProxyActionParamsSchema,
} from './deployAccumulativeMerkleDistributor'

export const actions = {
  init: {
    name: 'Deploy ERC20 Token',
    actionClassName: DeployInfinitERC20Action.name,
    paramSchema: DeployInfinitERC20ActionParamsSchema,
    signers: ['deployer'],
  },
  getProofMerkleTree: {
    name: 'Generate Merkle Tree',
    actionClassName: GetProofMerkleTreeAction.name,
    paramSchema: GetProofMerkleTreeActionParamsSchema,
    signers: [],
  },
  deployInfinitERC20Burnable: {
    name: 'Deploy ERC20 (Burnable) Token',
    actionClassName: DeployInfinitERC20BurnableAction.name,
    paramSchema: DeployInfinitERC20BurnableActionParamsSchema,
    signers: ['deployer'],
  },
  deployAccumulativeMerkleDistributorAction: {
    name: 'Deploy Accumulative Merkle Distributor',
    actionClassName: DeployAccumulativeMerkleDistributorAction.name,
    paramSchema: DeployAccumulativeMerkleDistributorProxyActionParamsSchema,
    signers: ['deployer'],
  },
  setMerkleRootAction: {
    name: 'Set Merkle Root',
    actionClassName: SetMerkleRootAction.name,
    paramSchema: SetMerkleRootActionParamsSchema,
    signers: ['owner'],
  },
} satisfies InfinitActionRecord

export {
  DeployAccumulativeMerkleDistributorAction,
  DeployInfinitERC20Action,
  DeployInfinitERC20BurnableAction,
  GetProofMerkleTreeAction,
  SetMerkleRootAction,
}
