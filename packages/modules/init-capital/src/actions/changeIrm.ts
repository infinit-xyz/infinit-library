import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import {
  DeployDoubleSlopeIRMSubActionMsg,
  DeployDoubleSlopeIRMsSubAction,
  DoubleSlopeIRMConfig,
} from '@actions/subactions/deployDoubleSlopeIRMs'
import { SetIrmSubAction } from '@actions/subactions/setIrm'
import { DeployDoubleSlopeIRMTxBuilderParams } from '@actions/subactions/tx-builders/DoubleSlopeIRM/deploy'

import { InitCapitalRegistry } from '@/src/type'

export const ChangeIrmActionParamsSchema = z.object({
  pool: zodAddressNonZero.describe(`Address of lending pool e.g. '0x123...abc'`),
  doubleSlopeIRMConfig: z
    .object({
      name: z.string().describe(`Name of the reserve interest rate model that will be displayed in the registry`),
      params: z
        .object({
          baseBorrowRateE18: z.bigint().nonnegative().describe(`Base borrow rate in E18 (e.g., 10% = 0.1 * 1e18)`),
          jumpUtilizationRateE18: z
            .bigint()
            .nonnegative()
            .describe(`Utilization rate in E18 where the jump multiplier is applied (e.g., 80% = 0.8 * 1e18)`),
          borrowRateMultiplierE18: z.bigint().nonnegative().describe(`Borrow rate multiplier in E18 (e.g., 1% = 0.01 * 1e18)`),
          jumpRateMultiplierE18: z.bigint().nonnegative().describe(`Jump multiplier rate in E18 (e.g., 1% = 0.01 * 1e18)`),
        })
        .describe(
          `Parameters for the interest rate model => real borrow rate = baseRate + borrowRate * min(currentUtil, jumpUtil) + jumpRate * max(0, uti - jumpUtil)`,
        ) satisfies z.ZodType<DeployDoubleSlopeIRMTxBuilderParams>,
    })
    .describe(`Parameters for new interest rate model`) satisfies z.ZodType<DoubleSlopeIRMConfig>,
})

export type ChangeIrmActionParams = z.infer<typeof ChangeIrmActionParamsSchema>

export type ChangeIrmActionData = {
  params: ChangeIrmActionParams
  signer: Record<'deployer' | 'guardian', InfinitWallet>
}

export class ChangeIrmAction extends Action<ChangeIrmActionData, InitCapitalRegistry> {
  constructor(data: ChangeIrmActionData) {
    validateActionData(data, ChangeIrmActionParamsSchema, ['guardian'])
    super(ChangeIrmAction.name, data)
  }

  protected getSubActions(): ((message: any) => SubAction)[] {
    const deployer = this.data.signer['deployer']
    const guardian = this.data.signer['guardian']

    return [
      () =>
        new DeployDoubleSlopeIRMsSubAction(deployer, {
          doubleSlopeIRMConfigs: [this.data.params.doubleSlopeIRMConfig],
        }),
      (message: DeployDoubleSlopeIRMSubActionMsg) =>
        new SetIrmSubAction(guardian, {
          pool: this.data.params.pool,
          irm: message.doubleSlopeIrms[this.data.params.doubleSlopeIRMConfig.name],
        }),
    ]
  }
}
