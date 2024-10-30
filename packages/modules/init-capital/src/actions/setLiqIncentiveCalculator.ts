import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetLiqIncentiveCalculatorSubAction } from '@actions/subactions/setLiqIncentiveCalculator'

import { InitCapitalRegistry } from '@/src/type'

export const SetLiqIncentiveCalculatorParamsSchema = z.object({
  initCore: zodAddressNonZero.describe(`Address of init capital core contract e.g. '0x123...abc'`),
  liqIncentiveCalculator: zodAddress.describe(`Address of liq incentive calculator e.g. '0x123...abc'`),
})

export type SetLiqIncentiveCalculatorParams = z.infer<typeof SetLiqIncentiveCalculatorParamsSchema>

export type SetLiqIncentiveCalculatorActionData = {
  params: SetLiqIncentiveCalculatorParams
  signer: Record<'guardian', InfinitWallet>
}

export class SetLiqIncentiveCalculatorAction extends Action<SetLiqIncentiveCalculatorActionData, InitCapitalRegistry> {
  constructor(data: SetLiqIncentiveCalculatorActionData) {
    validateActionData(data, SetLiqIncentiveCalculatorParamsSchema, ['guardian'])
    super(SetLiqIncentiveCalculatorAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const guardian = this.data.signer['guardian']
    const SetLiqIncentiveCalculatorParams: SetLiqIncentiveCalculatorParams = {
      initCore: this.data.params.initCore,
      liqIncentiveCalculator: this.data.params.liqIncentiveCalculator,
    }

    return [new SetLiqIncentiveCalculatorSubAction(guardian, SetLiqIncentiveCalculatorParams)]
  }
}
