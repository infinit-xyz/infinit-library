import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetModeStatusSubAction } from '@actions/subactions/setModeStatus'
import { SetModeStatusTxBuilderParams } from '@actions/subactions/tx-builders/Config/setModeStatus'

import { InitCapitalRegistry } from '@/src/type'

export const SetModeStatusActionParamsSchema = z.object({
  config: zodAddressNonZero.describe(`Address of protocol config e.g. '0x123...abc'`),
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

  protected getSubActions(): SubAction[] {
    const guardian = this.data.signer['guardian']
    const setModeStatusActionParams: SetModeStatusActionParams = {
      config: this.data.params.config,
      modeStatus: this.data.params.modeStatus,
    }

    return [new SetModeStatusSubAction(guardian, setModeStatusActionParams)]
  }
}
