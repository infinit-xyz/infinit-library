import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData } from '@infinit-xyz/core/internal'

import { DeployUniswapV3StakerSubAction } from '@actions/subactions/deployUniswapV3Staker'

import { UniswapV3Registry } from '@/src/type'

export const DeployUniswapV3StakerParamsSchema = z.object({
  maxIncentiveStartLeadTime: z.bigint().describe(`The max amount of seconds into the future the incentive startTime can be set`),
  maxIncentiveDuration: z.bigint().describe(`The max duration of an incentive in seconds`),
})

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

  protected getSubActions(registry: UniswapV3Registry): SubAction[] {
    if (!registry['uniswapV3Factory']) {
      throw new ValidateInputValueError('registry: uniswapV3Factory not found')
    }
    if (!registry['nonfungiblePositionManager']) {
      throw new ValidateInputValueError('registry: nonfungiblePositionManager not found')
    }
    const deployer: InfinitWallet = this.data.signer['deployer']
    const params = this.data.params

    return [
      new DeployUniswapV3StakerSubAction(deployer, {
        factory: registry['uniswapV3Factory'],
        nonfungiblePositionManager: registry['nonfungiblePositionManager'],
        maxIncentiveStartLeadTime: params.maxIncentiveStartLeadTime,
        maxIncentiveDuration: params.maxIncentiveDuration,
      }),
    ]
  }
}
