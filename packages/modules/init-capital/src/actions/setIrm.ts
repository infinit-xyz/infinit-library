import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetIrmSubAction } from '@actions/subactions/setIrm'

import { InitCapitalRegistry } from '@/src/type'

export const SetIrmActionParamsSchema = z.object({
  pool: zodAddressNonZero.describe(`Address of lending pool e.g. '0x123...abc'`),
  irm: zodAddress.describe(`Address of interest rate model e.g. '0x123...abc'`),
})

export type SetIrmActionParams = z.infer<typeof SetIrmActionParamsSchema>

export type SetIrmActionData = {
  params: SetIrmActionParams
  signer: Record<'guardian', InfinitWallet>
}

export class SetIrmAction extends Action<SetIrmActionData, InitCapitalRegistry> {
  constructor(data: SetIrmActionData) {
    validateActionData(data, SetIrmActionParamsSchema, ['guardian'])
    super(SetIrmAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const guardian = this.data.signer['guardian']
    const setIrmActionParams: SetIrmActionParams = {
      pool: this.data.params.pool,
      irm: this.data.params.irm,
    }

    return [new SetIrmSubAction(guardian, setIrmActionParams)]
  }
}
