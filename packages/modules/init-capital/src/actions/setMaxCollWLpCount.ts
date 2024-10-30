import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetMaxCollWLpCountSubAction, SetMaxCollWLpCountSubActionParams } from '@actions/subactions/setMaxCollWLpCount'

import { InitCapitalRegistry } from '@/src/type'

export const SetMaxCollWLpCountActionParamsSchema = z.object({
  config: zodAddressNonZero.describe(`Address of protocol config e.g. '0x123...abc'`),
  modeMaxCollWLpCount: z
    .array(
      z
        .object({
          mode: z.number().positive().describe(`Number of mode start from 0 e.g. 1`),
          maxCollWLpCount: z.number().positive().describe(`Number of max collateral Wrapped Lp count to set e.g. 10`),
        })
        .describe('Object containing mode and maxCollWLpCount to set max collateral Wrapped Lp count'),
    )
    .describe('Array of mode and maxCollWLpCount to set max collateral Wrapped Lp count'),
}) satisfies z.ZodSchema<SetMaxCollWLpCountSubActionParams>

export type SetMaxCollWLpCountActionParams = z.infer<typeof SetMaxCollWLpCountActionParamsSchema>

export type SetMaxCollWLpCountActionData = {
  params: SetMaxCollWLpCountActionParams
  signer: Record<'guardian', InfinitWallet>
}

export class SetMaxCollWLpCountAction extends Action<SetMaxCollWLpCountActionData, InitCapitalRegistry> {
  constructor(data: SetMaxCollWLpCountActionData) {
    validateActionData(data, SetMaxCollWLpCountActionParamsSchema, ['guardian'])
    super(SetMaxCollWLpCountAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const guardian = this.data.signer['guardian']
    const setMaxCollWLpCountParams: SetMaxCollWLpCountActionParams = {
      config: this.data.params.config,
      modeMaxCollWLpCount: this.data.params.modeMaxCollWLpCount,
    }

    return [new SetMaxCollWLpCountSubAction(guardian, setMaxCollWLpCountParams)]
  }
}
