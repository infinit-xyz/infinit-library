import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { SetOracleSubAction } from '@actions/subactions/setOracle'

import { InitCapitalRegistry } from '@/src/type'

export const SetOracleActionParamsSchema = z.object({
  oracle: zodAddress.describe(`Address of oracle e.g. '0x123...abc'`),
})

export type SetOracleActionParams = z.infer<typeof SetOracleActionParamsSchema>

export type SetOracleActionData = {
  params: SetOracleActionParams
  signer: Record<'governor', InfinitWallet>
}

export class SetOracleAction extends Action<SetOracleActionData, InitCapitalRegistry> {
  constructor(data: SetOracleActionData) {
    validateActionData(data, SetOracleActionParamsSchema, ['governor'])
    super(SetOracleAction.name, data)
  }

  protected getSubActions(registry: InitCapitalRegistry): SubAction[] {
    const governor = this.data.signer['governor']
    // validate registry
    if (!registry.initCoreProxy) throw new ValidateInputValueError('registry: initCoreProxy not found')
    const initCoreProxy = registry.initCoreProxy

    return [
      new SetOracleSubAction(governor, {
        initCore: initCoreProxy,
        oracle: this.data.params.oracle,
      }),
    ]
  }
}
