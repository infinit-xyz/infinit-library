import { z } from 'zod'

import { Address } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetBorrFactorsSubAction, SetBorrFactorsSubActionParams } from '@actions/subactions/setBorrFactors'
import { SetCollFactorsSubAction, SetCollFactorsSubActionParams } from '@actions/subactions/setCollFactors'

import { InitCapitalRegistry } from '@/src/type'

export const SetModeFactorsActionParamsSchema = z.object({
  config: zodAddressNonZero.describe(`Address of protocol config e.g. '0x123...abc'`),
  mode: z.number().nonnegative().describe(`Mode number start from 0 e.g. 1`),
  poolFactors: z.array(
    z.object({
      pool: zodAddressNonZero.describe(`Address of pool e.g. '0x123...abc'`),
      collFactor: z.bigint().optional().describe('Collateral factor in E18 e.g. 11n * 10n ** 17n'),
      borrFactor: z.bigint().optional().describe('Borrow factor in E18 e.g. 9n * 10n ** 17n'),
    }),
  ),
})

export type SetModeFactorsActionParams = z.infer<typeof SetModeFactorsActionParamsSchema>

export type SetModeFactorsActionData = {
  params: SetModeFactorsActionParams
  signer: Record<'guardian', InfinitWallet>
}

export class SetModeFactorsAction extends Action<SetModeFactorsActionData, InitCapitalRegistry> {
  constructor(data: SetModeFactorsActionData) {
    validateActionData(data, SetModeFactorsActionParamsSchema, ['guardian'])
    super(SetModeFactorsAction.name, data)
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
