import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetOracleSubAction } from '@actions/subactions/setOracle'

import { InitCapitalRegistry } from '@/src/type'

export const SetOracleParamsSchema = z.object({
  initCore: zodAddressNonZero.describe(`Address of init core e.g. '0x123...abc'`),
  oracle: zodAddress.describe(`Address of oracle e.g. '0x123...abc'`),
})

export type SetOracleParams = z.infer<typeof SetOracleParamsSchema>

export type SetOracleActionData = {
  params: SetOracleParams
  signer: Record<'governor', InfinitWallet>
}

export class SetOracleAction extends Action<SetOracleActionData, InitCapitalRegistry> {
  constructor(data: SetOracleActionData) {
    validateActionData(data, SetOracleParamsSchema, ['governor'])
    super(SetOracleAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const governor = this.data.signer['governor']
    const SetOracleParams: SetOracleParams = {
      initCore: this.data.params.initCore,
      oracle: this.data.params.oracle,
    }

    return [new SetOracleSubAction(governor, SetOracleParams)]
  }
}
