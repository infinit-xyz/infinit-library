import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import {
  DeployDefaultReserveInterestRateStrategySubAction,
  DeployDefaultReserveInterestRateStrategySubActionParams,
} from '@actions/subactions/deployDefaultReserveInterestRateStrategy'

export const DefaultReserveInterestRateStrategyParamsSchema = z.object({
  optimalUsageRatio: z.bigint(),
  baseVariableBorrowRate: z.bigint(),
  variableRateSlope1: z.bigint(),
  variableRateSlope2: z.bigint(),
  stableRateSlope1: z.bigint(),
  stableRateSlope2: z.bigint(),
  baseStableRateOffset: z.bigint(),
  stableRateExcessOffset: z.bigint(),
  optimalStableToTotalDebtRatio: z.bigint(),
})
export const DeployDefaultReserveInterestRateStrategyActionParamsSchema = z.object({
  defaultReserveInterestRateStrategyConfigs: z
    .array(
      z.object({
        name: z.string(),
        params: DefaultReserveInterestRateStrategyParamsSchema.merge(z.object({ poolAddressesProvider: zodAddress })),
      }),
    )
    .describe(`The default reserve interest rate strategy configs`),
}) satisfies z.ZodType<DeployDefaultReserveInterestRateStrategySubActionParams>

export type DefaultReserveInterestRateStrategyParams = z.infer<typeof DefaultReserveInterestRateStrategyParamsSchema>

export type DeployDefaultReserveInterestRateStrategyActionParams = z.infer<
  typeof DeployDefaultReserveInterestRateStrategyActionParamsSchema
>

export type DeployDefaultReserveInterestRateStrategyData = {
  params: DeployDefaultReserveInterestRateStrategyActionParams
  signer: Record<string, InfinitWallet>
}

export class DeployDefaultReserveInterestRateStrategyAction extends Action<DeployDefaultReserveInterestRateStrategyData> {
  constructor(data: DeployDefaultReserveInterestRateStrategyData) {
    validateActionData(data, DeployDefaultReserveInterestRateStrategyActionParamsSchema, ['deployer'])
    super(DeployDefaultReserveInterestRateStrategyAction.name, data)
  }
  protected getSubActions(): SubAction[] {
    const deployer = this.data.signer['deployer']
    const params = this.data.params

    // return subactions
    return [new DeployDefaultReserveInterestRateStrategySubAction(deployer, params)]
  }
}
