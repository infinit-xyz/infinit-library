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
  signer: Record<'owner', InfinitWallet>
}

export class SetEmissionAdminAction extends Action<SetEmissionAdminData> {
  constructor(data: SetEmissionAdminData) {
    console.log('data', data)
    validateActionData(data, SetEmissionAdminActionParamsSchema, ['owner'])
    super(SetEmissionAdminAction.name, data)
  }
  protected getSubActions(): SubAction[] {
    const owner = this.data.signer['owner']
    const params = this.data.params

    return [new SetEmissionAdminSubAction(owner, params)]
  }
}
