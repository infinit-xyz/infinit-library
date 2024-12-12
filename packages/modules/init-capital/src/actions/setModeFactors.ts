import { z } from 'zod'

import { Address } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetBorrFactorsSubAction, SetBorrFactorsSubActionParams } from '@actions/subactions/setBorrFactors'
import { SetCollFactorsSubAction, SetCollFactorsSubActionParams } from '@actions/subactions/setCollFactors'

import { InitCapitalRegistry } from '@/src/type'

export const SetModeFactorsActionParamsSchema = z.object({
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
  signer: Record<'governor', InfinitWallet>
}

export class SetModeFactorsAction extends Action<SetModeFactorsActionData, InitCapitalRegistry> {
  constructor(data: SetModeFactorsActionData) {
    validateActionData(data, SetModeFactorsActionParamsSchema, ['governor'])
    super(SetModeFactorsAction.name, data)
  }

  protected getSubActions(registry: InitCapitalRegistry): SubAction[] {
    const governor = this.data.signer['governor']

    // validate registry
    if (!registry.configProxy) throw new ValidateInputValueError('registry: configProxy not found')
    const configProxy = registry.configProxy

    const collPools: Address[] = []
    const borrPools: Address[] = []
    const collFactors: bigint[] = []
    const borrFactors: bigint[] = []
    const subActions: SubAction[] = []

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
    // set coll factors if exist
    if (collPools.length > 0) {
      const setCollFactorsParams: SetCollFactorsSubActionParams = {
        config: configProxy,
        mode: this.data.params.mode,
        pools: collPools,
        factors_e18: collFactors,
      }
      subActions.push(new SetCollFactorsSubAction(governor, setCollFactorsParams))
    }
    // set borr factors if exist
    if (borrPools.length > 0) {
      const setBorrFactorsParams: SetBorrFactorsSubActionParams = {
        config: configProxy,
        mode: this.data.params.mode,
        pools: borrPools,
        factors_e18: borrFactors,
      }
      subActions.push(new SetBorrFactorsSubAction(governor, setBorrFactorsParams))
    }

    return subActions
  }
}
