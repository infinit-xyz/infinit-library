import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetModeStatusesSubAction } from '@actions/subactions/setModeStatuses'
import { SetModeStatusTxBuilderParams } from '@actions/subactions/tx-builders/Config/setModeStatus'

import { InitCapitalRegistry } from '@/src/type'

export const SetModeStatusesParamsSchema = z.object({
  config: zodAddressNonZero.describe(`Address of protocol config e.g. '0x123...abc'`),
  modeStatuses: z.custom<Omit<SetModeStatusTxBuilderParams, 'config'>[]>().describe(`pool config parameters`),
})

export type SetModeStatusesParams = z.infer<typeof SetModeStatusesParamsSchema>

export type SetModeStatusesActionData = {
  params: SetModeStatusesParams
  signer: Record<'guardian', InfinitWallet>
}

export class SetModeStatusesAction extends Action<SetModeStatusesActionData, InitCapitalRegistry> {
  constructor(data: SetModeStatusesActionData) {
    validateActionData(data, SetModeStatusesParamsSchema, ['guardian'])
    super(SetModeStatusesAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const guardian = this.data.signer['guardian']
    const SetModeStatusesParams: SetModeStatusesParams = {
      config: this.data.params.config,
      modeStatuses: this.data.params.modeStatuses,
    }

    return [new SetModeStatusesSubAction(guardian, SetModeStatusesParams)]
  }
}
