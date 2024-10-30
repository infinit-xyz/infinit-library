import { z } from 'zod'

import { Address } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetBorrFactorsSubAction, SetBorrFactorsSubActionParams } from '@actions/subactions/setBorrFactors'
import { SetCollFactorsSubAction, SetCollFactorsSubActionParams } from '@actions/subactions/setCollFactors'

import { InitCapitalRegistry } from '@/src/type'

export const SetModeStatusesParamsSchema = z.object({
  config: zodAddressNonZero.describe(`Address of protocol config e.g. '0x123...abc'`),
  mode: z.number().describe(`mode number`),
  poolFactors: z.array(
    z.object({
      pool: zodAddressNonZero.describe(`Address of pool e.g. '0x123...abc'`),
      collFactor: z.bigint().optional().describe('Collateral factor in E18'),
      borrFactor: z.bigint().optional().describe('Borrow factor in E18'),
    }),
  ),
})

export type SetModeStatusesParams = z.infer<typeof SetModeStatusesParamsSchema>

export type SetModeFactorsActionData = {
  params: SetModeStatusesParams
  signer: Record<'guardian', InfinitWallet>
}

export class SetModeStatusesAction extends Action<SetModeFactorsActionData, InitCapitalRegistry> {
  constructor(data: SetModeFactorsActionData) {
    validateActionData(data, SetModeStatusesParamsSchema, ['guardian'])
    super(SetModeStatusesAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const guardian = this.data.signer['guardian']
    const collPools: Address[] = []
    const borrPools: Address[] = []
    const collFactors: bigint[] = []
    const borrFactors: bigint[] = []

    this.data.params.poolFactors.forEach((poolFactor) => {
      if (poolFactor.collFactor && poolFactor.collFactor > 0n) {
        collPools.push(poolFactor.pool)
        collFactors.push(poolFactor.collFactor)
      }
      if (poolFactor.borrFactor && poolFactor.borrFactor > 0n) {
        borrPools.push(poolFactor.pool)
        borrFactors.push(poolFactor.borrFactor)
      }
    })

    const setCollFactorsParams: SetCollFactorsSubActionParams = {
      config: this.data.params.config,
      mode: this.data.params.mode,
      pools: collPools,
      factors_e18: collFactors,
    }

    const setBorrFactorsParams: SetBorrFactorsSubActionParams = {
      config: this.data.params.config,
      mode: this.data.params.mode,
      pools: borrPools,
      factors_e18: borrFactors,
    }

    return [new SetCollFactorsSubAction(guardian, setCollFactorsParams), new SetBorrFactorsSubAction(guardian, setBorrFactorsParams)]
  }
}
