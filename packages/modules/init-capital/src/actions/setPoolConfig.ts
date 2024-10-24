import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetPoolConfigSubAction } from '@actions/subactions/setPoolConfig'
import { SetPoolConfigTxBuilderParams } from '@actions/subactions/tx-builders/Config/setPoolConfig'

import { InitCapitalRegistry } from '@/src/type'

export const SetPoolConfigParamsSchema = z.object({
  config: zodAddressNonZero.describe(`Address of protocol config e.g. '0x123...abc'`),
  batchPoolConfigParams: z.custom<Omit<SetPoolConfigTxBuilderParams, 'config'>[]>().describe(`pool config parameters`),
})

export type SetPoolConfigParams = z.infer<typeof SetPoolConfigParamsSchema>

export type SetPoolConfigActionData = {
  params: SetPoolConfigParams
  signer: Record<'guardian', InfinitWallet>
}

export class SetPoolConfigAction extends Action<SetPoolConfigActionData, InitCapitalRegistry> {
  constructor(data: SetPoolConfigActionData) {
    validateActionData(data, SetPoolConfigParamsSchema, ['guardian'])
    super(SetPoolConfigAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const guardian = this.data.signer['guardian']
    const setPoolConfigParams: SetPoolConfigParams = {
      config: this.data.params.config,
      batchPoolConfigParams: this.data.params.batchPoolConfigParams,
    }

    return [new SetPoolConfigSubAction(guardian, setPoolConfigParams)]
  }
}
