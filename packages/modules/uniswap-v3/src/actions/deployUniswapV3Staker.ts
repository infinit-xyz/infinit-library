import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { DeployUniswapV3StakerSubAction, DeployUniswapV3StakerSubActionParams } from '@actions/subactions/deployUniswapV3Staker'

import { UniswapV3Registry } from '@/src/type'

export const DeployUniswapV3StakerParamsSchema = z.object({
  factory: zodAddress.describe(`Address of the Uniswap V3 factory`),
  nonfungiblePositionManager: zodAddress.describe(`Address of the nonfungible position manager`),
  maxIncentiveStartLeadTime: z.bigint().describe(`The max amount of seconds into the future the incentive startTime can be set`),
  maxIncentiveDuration: z.bigint().describe(`The max duration of an incentive in seconds`),
}) satisfies z.ZodType<DeployUniswapV3StakerSubActionParams>

export type DeployUniswapV3StakerParams = z.infer<typeof DeployUniswapV3StakerParamsSchema>

export type DeployUniswapV3StakerActionData = {
  params: DeployUniswapV3StakerParams
  signer: Record<'deployer', InfinitWallet>
}

export class DeployUniswapV3StakerAction extends Action<DeployUniswapV3StakerActionData, UniswapV3Registry> {
  constructor(data: DeployUniswapV3StakerActionData) {
    validateActionData(data, DeployUniswapV3StakerParamsSchema, ['deployer'])
    super(DeployUniswapV3StakerAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const deployer: InfinitWallet = this.data.signer['deployer']
    const params = this.data.params

    return [
      new DeployUniswapV3StakerSubAction(deployer, {
        factory: params.factory,
        nonfungiblePositionManager: params.nonfungiblePositionManager,
        maxIncentiveStartLeadTime: params.maxIncentiveStartLeadTime,
        maxIncentiveDuration: params.maxIncentiveDuration,
      }),
    ]
  }
}
