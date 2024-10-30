import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetMaxPriceDeviations_e18SubAction, TokenMaxPriceDeviation } from '@actions/subactions/setMaxPriceDeviations_e18'

import { InitCapitalRegistry } from '@/src/type'

export const SetMaxPriceDeviationActionParamsSchema = z.object({
  initOracle: zodAddressNonZero.describe(`Address of oracle e.g. '0x123...abc'`),
  tokenMaxPriceDeviations: z
    .custom<TokenMaxPriceDeviation[]>()
    .describe(`oracle token price deviation parameters e.g. ['0x123...abc', 10n ** 18n]`),
})

export type SetMaxPriceDeviationActionParams = z.infer<typeof SetMaxPriceDeviationActionParamsSchema>

export type SetMaxPriceDeviationActionData = {
  params: SetMaxPriceDeviationActionParams
  signer: Record<'governor', InfinitWallet>
}

export class SetMaxPriceDeviationAction extends Action<SetMaxPriceDeviationActionData, InitCapitalRegistry> {
  constructor(data: SetMaxPriceDeviationActionData) {
    validateActionData(data, SetMaxPriceDeviationActionParamsSchema, ['governor'])
    super(SetMaxPriceDeviationAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const governor = this.data.signer['governor']
    const setMaxPriceDeviationActionParams: SetMaxPriceDeviationActionParams = {
      initOracle: this.data.params.initOracle,
      tokenMaxPriceDeviations: this.data.params.tokenMaxPriceDeviations,
    }

    return [new SetMaxPriceDeviations_e18SubAction(governor, setMaxPriceDeviationActionParams)]
  }
}
