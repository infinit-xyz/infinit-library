import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetMaxPriceDeviations_e18SubAction, TokenMaxPriceDeviation } from '@actions/subactions/setMaxPriceDeviations_e18'

import { InitCapitalRegistry } from '@/src/type'

export const SetMaxPriceDeviations_e18ParamsSchema = z.object({
  initOracle: zodAddressNonZero.describe(`Address of oracle e.g. '0x123...abc'`),
  tokenMaxPriceDeviations: z
    .custom<TokenMaxPriceDeviation[]>()
    .describe(`oracle token price deviation parameters e.g. ['0x123...abc', 10n ** 18n]`),
})

export type SetMaxPriceDeviations_e18Params = z.infer<typeof SetMaxPriceDeviations_e18ParamsSchema>

export type SetMaxPriceDeviations_e18ActionData = {
  params: SetMaxPriceDeviations_e18Params
  signer: Record<'governor', InfinitWallet>
}

export class SetMaxPriceDeviations_e18Action extends Action<SetMaxPriceDeviations_e18ActionData, InitCapitalRegistry> {
  constructor(data: SetMaxPriceDeviations_e18ActionData) {
    validateActionData(data, SetMaxPriceDeviations_e18ParamsSchema, ['governor'])
    super(SetMaxPriceDeviations_e18Action.name, data)
  }

  protected getSubActions(): SubAction[] {
    const governor = this.data.signer['governor']
    const setMaxPriceDeviations_e18Params: SetMaxPriceDeviations_e18Params = {
      initOracle: this.data.params.initOracle,
      tokenMaxPriceDeviations: this.data.params.tokenMaxPriceDeviations,
    }

    return [new SetMaxPriceDeviations_e18SubAction(governor, setMaxPriceDeviations_e18Params)]
  }
}
