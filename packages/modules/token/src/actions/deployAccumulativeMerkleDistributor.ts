import { z } from 'zod'

import { toFunctionSelector } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import {
  DeployAccumulativeMerkleDistributorSubAction,
  DeployAccumulativeMerkleDistributorSubActionMsg,
  DeployAccumulativeMerkleDistributorSubActionParams,
} from '@actions/subactions/deployAccumulativeMerkleDistributor'

import { DeployERC1967ProxyAndInitializeSubAction } from './subactions/deployERC1967ProxyAndInitialize'
import { TokenRegistry } from '@/src/type'

export const DeployAccumulativeMerkleDistributorProxyActionParamsSchema = z.object({
  token: zodAddressNonZero.describe(`airdrop token`),
})

export type DeployAccumulativeMerkleDistributorActionParams = z.infer<typeof DeployAccumulativeMerkleDistributorProxyActionParamsSchema>

export type DeployAccumulativeMerkleDistributorActionData = {
  params: DeployAccumulativeMerkleDistributorActionParams
  signer: Record<'deployer', InfinitWallet>
}

export class DeployAccumulativeMerkleDistributorAction extends Action<DeployAccumulativeMerkleDistributorActionData, TokenRegistry> {
  constructor(data: DeployAccumulativeMerkleDistributorActionData) {
    validateActionData(data, DeployAccumulativeMerkleDistributorProxyActionParamsSchema, ['deployer'])
    super(DeployAccumulativeMerkleDistributorAction.name, data)
  }

  protected getSubActions(): ((message: any) => SubAction)[] {
    const deployer = this.data.signer['deployer']
    const params = this.data.params
    const deployAccumulativeMerkleDistributorSubActionParams: DeployAccumulativeMerkleDistributorSubActionParams = {
      token: params.token,
    }

    const encodedInitializeData = toFunctionSelector('initialize()')

    return [
      () => new DeployAccumulativeMerkleDistributorSubAction(deployer, deployAccumulativeMerkleDistributorSubActionParams),
      (message: DeployAccumulativeMerkleDistributorSubActionMsg) => {
        return new DeployERC1967ProxyAndInitializeSubAction(deployer, {
          implementation: message.accMerkleDistributor,
          data: encodedInitializeData,
        })
      },
    ]
  }
}
