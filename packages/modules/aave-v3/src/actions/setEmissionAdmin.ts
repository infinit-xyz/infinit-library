import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetEmissionAdminSubAction } from '@actions/subactions/setEmissionAdmin'

import { AaveV3Registry } from '@/src/type'

export const SetEmissionAdminActionParamsSchema = z.object({
  reward: zodAddressNonZero.describe(`The address of the reward token e.g. '0x123...abc'`),
  admin: zodAddressNonZero.describe(`The address of the reward admin specific to this reward token e.g. '0x123...abc'`),
})

export type SetEmissionAdminActionParams = z.infer<typeof SetEmissionAdminActionParamsSchema>

export type SetEmissionAdminData = {
  params: SetEmissionAdminActionParams
  signer: Record<'emissionManagerOwner', InfinitWallet>
}

export class SetEmissionAdminAction extends Action<SetEmissionAdminData> {
  constructor(data: SetEmissionAdminData) {
    validateActionData(data, SetEmissionAdminActionParamsSchema, ['emissionManagerOwner'])
    super(SetEmissionAdminAction.name, data)
  }
  protected getSubActions(registry: AaveV3Registry): SubAction[] {
    if (!registry.emissionManager) {
      throw new ValidateInputValueError('registry: emissionManager not found')
    }
    const owner = this.data.signer['emissionManagerOwner']
    const params = {
      ...this.data.params,
      emissionManager: registry.emissionManager,
    }

    return [new SetEmissionAdminSubAction(owner, params)]
  }
}
