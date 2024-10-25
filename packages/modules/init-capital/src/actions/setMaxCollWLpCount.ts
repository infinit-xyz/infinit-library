import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetMaxCollWLpCountSubAction, SetMaxCollWLpCountSubActionParams } from '@actions/subactions/setMaxCollWLpCount'

import { InitCapitalRegistry } from '@/src/type'

export const SetMaxCollWLpCountParamsSchema = z.object({
  config: zodAddressNonZero.describe(`Address of protocol config e.g. '0x123...abc'`),
  modeMaxCollWLpCount: z
    .array(
      z
        .object({
          mode: z.number().positive().describe(`Number of mode to set max collateral Wrapped Lp count`),
          maxCollWLpCount: z.number().positive().describe(`Number of max collateral Wrapped Lp count to set`),
        })
        .describe('Object containing mode and maxCollWLpCount to set max collateral Wrapped Lp count'),
    )
    .describe('Array of mode and maxCollWLpCount to set max collateral Wrapped Lp count'),
}) satisfies z.ZodSchema<SetMaxCollWLpCountSubActionParams>

export type SetMaxCollWLpCountParams = z.infer<typeof SetMaxCollWLpCountParamsSchema>

export type SetMaxCollWLpCountActionData = {
  params: SetMaxCollWLpCountParams
  signer: Record<'guardian', InfinitWallet>
}

export class SetMaxCollWLpCountAction extends Action<SetMaxCollWLpCountActionData, InitCapitalRegistry> {
  constructor(data: SetMaxCollWLpCountActionData) {
    validateActionData(data, SetMaxCollWLpCountParamsSchema, ['guardian'])
    super(SetMaxCollWLpCountAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const guardian = this.data.signer['guardian']
    const setMaxCollWLpCountParams: SetMaxCollWLpCountParams = {
      config: this.data.params.config,
      modeMaxCollWLpCount: this.data.params.modeMaxCollWLpCount,
    }

    return [new SetMaxCollWLpCountSubAction(guardian, setMaxCollWLpCountParams)]
  }
}
