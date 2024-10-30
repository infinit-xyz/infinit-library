import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData } from '@infinit-xyz/core/internal'

import {
  DeployDoubleSlopeIRMsSubAction,
  DeployDoubleSlopeIRMsSubActionParams,
  DoubleSlopeIRMConfig,
} from '@actions/subactions/deployDoubleSlopeIRMs'
import { DeployDoubleSlopeIRMTxBuilderParams } from '@actions/subactions/tx-builders/DoubleSlopeIRM/deploy'

import { InitCapitalRegistry } from '@/src/type'

export const DeployDoubleSlopeIRMsActionParamsSchema = z.object({
  doubleSlopeIRMConfigs: z.array(
    z
      .object({
        name: z.string().describe(`Name of the reserve interest rate model that will be displayed in the registry`),
        params: z
          .object({
            baseBorrowRateE18: z.bigint().describe(`Base borrow rate in E18 (e.g., 10% = 0.1 * 1e18)`),
            jumpUtilizationRateE18: z
              .bigint()
              .describe(`Utilization rate in E18 where the jump multiplier is applied (e.g., 80% = 0.8 * 1e18)`),
            borrowRateMultiplierE18: z.bigint().describe(`Borrow rate multiplier in E18 (e.g., 1% = 0.01 * 1e18)`),
            jumpRateMultiplierE18: z.bigint().describe(`Jump multiplier rate in E18 (e.g., 1% = 0.01 * 1e18)`),
          })
          .describe(
            `Parameters for the interest rate model => real borrow rate = baseRate + borrowRate * min(currentUtil, jumpUtil) + jumpRate * max(0, uti - jumpUtil)`,
          ) satisfies z.ZodType<DeployDoubleSlopeIRMTxBuilderParams>,
      })
      .describe(`List of parameters for interest rate model`) satisfies z.ZodType<DoubleSlopeIRMConfig>,
  ),
}) satisfies z.ZodType<DeployDoubleSlopeIRMsSubActionParams>

export type DefaultReserveInterestRateStrategyParams = z.infer<typeof DeployDoubleSlopeIRMsActionParamsSchema>

export type DeployDoubleSlopeIRMsActionParams = z.infer<typeof DeployDoubleSlopeIRMsActionParamsSchema>

export type DeployDoubleSlopeIRMsData = {
  params: DeployDoubleSlopeIRMsActionParams
  signer: Record<string, InfinitWallet>
}

export class DeployDoubleSlopeIRMsAction extends Action<DeployDoubleSlopeIRMsData, InitCapitalRegistry> {
  constructor(data: DeployDoubleSlopeIRMsData) {
    validateActionData(data, DeployDoubleSlopeIRMsActionParamsSchema, ['deployer'])
    super(DeployDoubleSlopeIRMsAction.name, data)
  }
  protected getSubActions(): SubAction[] {
    const deployer = this.data.signer['deployer']
    const params = this.data.params

    // return subactions
    return [new DeployDoubleSlopeIRMsSubAction(deployer, params)]
  }
}
