import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import {
  DeployInfinitERC20BurnableSubAction,
  DeployInfinitERC20BurnableSubActionParams,
} from '@actions/subactions/deployInfinitERC20Burnable'

import { TokenRegistry } from '@/src/type'

export const DeployInfinitERC20BurnableActionParamsSchema = z.object({
  owner: zodAddress.describe(`token owner`),
  name: z.string().describe(`token name`),
  symbol: z.string().describe(`token symbol`),
  maxSupply: z.bigint().describe(`token max supply`),
  initialSupply: z.bigint().describe(`token mint amount when deploy`),
})

export type DeployInfinitERC20BurnableActionParams = z.infer<typeof DeployInfinitERC20BurnableActionParamsSchema>

export type DeployInfinitERC20BurnableActionData = {
  params: DeployInfinitERC20BurnableActionParams
  signer: Record<'deployer', InfinitWallet>
}

export class DeployInfinitERC20BurnableAction extends Action<DeployInfinitERC20BurnableActionData, TokenRegistry> {
  constructor(data: DeployInfinitERC20BurnableActionData) {
    validateActionData(data, DeployInfinitERC20BurnableActionParamsSchema, ['deployer'])
    super(DeployInfinitERC20BurnableAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const deployer = this.data.signer['deployer']
    const params = this.data.params
    const deployInfinitERC20BurnableParams: DeployInfinitERC20BurnableSubActionParams = {
      owner: params.owner,
      name: params.name,
      symbol: params.symbol,
      maxSupply: params.maxSupply,
      initialSupply: params.initialSupply,
    }
    return [new DeployInfinitERC20BurnableSubAction(deployer, deployInfinitERC20BurnableParams)]
  }
}
