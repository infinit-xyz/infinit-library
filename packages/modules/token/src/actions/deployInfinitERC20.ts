import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { DeployInfinitERC20SubAction, DeployInfinitERC20SubActionParams } from '@actions/subactions/deployInfinitERC20'

import { TokenRegistry } from '@/src/type'

export const DeployInfinitERC20ActionParamsSchema = z.object({
  owner: zodAddressNonZero.describe(`token owner`),
  name: z.string().describe(`token name`),
  symbol: z.string().describe(`token symbol`),
  maxSupply: z.bigint().describe(`token max supply`),
  initialSupply: z.bigint().describe(`token mint amount when deploy`),
})

export type DeployInfinitERC20ActionParams = z.infer<typeof DeployInfinitERC20ActionParamsSchema>

export type DeployInfinitERC20ActionData = {
  params: DeployInfinitERC20ActionParams
  signer: Record<'deployer', InfinitWallet>
}

export class DeployInfinitERC20Action extends Action<DeployInfinitERC20ActionData, TokenRegistry> {
  constructor(data: DeployInfinitERC20ActionData) {
    validateActionData(data, DeployInfinitERC20ActionParamsSchema, ['deployer'])
    super(DeployInfinitERC20Action.name, data)
  }

  protected getSubActions(): SubAction[] {
    const deployer = this.data.signer['deployer']
    const params = this.data.params
    const deployInfinitERC20Params: DeployInfinitERC20SubActionParams = {
      owner: params.owner,
      name: params.name,
      symbol: params.symbol,
      maxSupply: params.maxSupply,
      initialSupply: params.initialSupply,
    }
    return [new DeployInfinitERC20SubAction(deployer, deployInfinitERC20Params)]
  }
}
