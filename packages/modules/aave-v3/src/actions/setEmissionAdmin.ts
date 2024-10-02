import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetEmissionAdminSubAction, SetEmissionAdminSubActionParams } from '@actions/subactions/setEmissionAdmin'

export const SetEmissionAdminActionParamsSchema = z.object({
  emissionManager: zodAddressNonZero.describe(`The address of the emission manager contract e.g. '0x123...abc'`),
  reward: zodAddressNonZero.describe(`The address of the reward token e.g. '0x123...abc'`),
  admin: zodAddressNonZero.describe(`The address of the reward admin specific to this reward token e.g. '0x123...abc'`),
}) satisfies z.ZodType<SetEmissionAdminSubActionParams>

export type SetEmissionAdminData = {
  params: SetEmissionAdminSubActionParams
  signer: Record<'emissionManagerOwner', InfinitWallet>
}

export class SetEmissionAdminAction extends Action<SetEmissionAdminData> {
  constructor(data: SetEmissionAdminData) {
    validateActionData(data, SetEmissionAdminActionParamsSchema, ['emissionManagerOwner'])
    super(SetEmissionAdminAction.name, data)
  }
  protected getSubActions(): SubAction[] {
    const owner = this.data.signer['emissionManagerOwner']
    const params = this.data.params

    return [new SetEmissionAdminSubAction(owner, params)]
  }
}
