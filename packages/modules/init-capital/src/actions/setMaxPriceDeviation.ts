import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData } from '@infinit-xyz/core/internal'

import { SetMaxPriceDeviations_e18SubAction, TokenMaxPriceDeviation } from '@actions/subactions/setMaxPriceDeviations_e18'

import { InitCapitalRegistry } from '@/src/type'

export const SetMaxPriceDeviationActionParamsSchema = z.object({
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

  protected getSubActions(registry: InitCapitalRegistry): SubAction[] {
    const governor = this.data.signer['governor']

    // validate registry
    if (!registry.initOracleProxy) throw new ValidateInputValueError('registry: initOracleProxy not found')

    return [
      new SetMaxPriceDeviations_e18SubAction(governor, {
        initOracle: registry.initOracleProxy,
        tokenMaxPriceDeviations: this.data.params.tokenMaxPriceDeviations,
      }),
    ]
  }
}
