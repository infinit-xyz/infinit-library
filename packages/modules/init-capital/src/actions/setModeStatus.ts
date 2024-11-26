import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData } from '@infinit-xyz/core/internal'

import { SetModeStatusSubAction } from '@actions/subactions/setModeStatus'
import { SetModeStatusTxBuilderParams } from '@actions/subactions/tx-builders/Config/setModeStatus'

import { InitCapitalRegistry } from '@/src/type'

export const SetModeStatusActionParamsSchema = z.object({
  modeStatus: z.custom<Omit<SetModeStatusTxBuilderParams, 'config'>[]>().describe(`mode status parameters`),
})

export type SetModeStatusActionParams = z.infer<typeof SetModeStatusActionParamsSchema>

export type SetModeStatusActionData = {
  params: SetModeStatusActionParams
  signer: Record<'guardian', InfinitWallet>
}

export class SetModeStatusAction extends Action<SetModeStatusActionData, InitCapitalRegistry> {
  constructor(data: SetModeStatusActionData) {
    validateActionData(data, SetModeStatusActionParamsSchema, ['guardian'])
    super(SetModeStatusAction.name, data)
  }

  protected getSubActions(registry: InitCapitalRegistry): SubAction[] {
    const guardian = this.data.signer['guardian']

    // validate registry
    if (!registry.configProxy) throw new ValidateInputValueError('registry: configProxy not found')

    return [
      new SetModeStatusSubAction(guardian, {
        config: registry.configProxy,
        modeStatus: this.data.params.modeStatus,
      }),
    ]
  }
}
