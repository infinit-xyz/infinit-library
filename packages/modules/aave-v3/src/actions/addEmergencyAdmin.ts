import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { AddEmergencyAdminSubAction, AddEmergencyAdminSubActionParams } from '@actions/subactions/addEmegencyAdmin'

import { AaveV3Registry } from '@/src/type'

export const AddEmergencyAdminActionParamsSchema = z.object({
  emergencyAdmin: zodAddress.describe(`The address of the emergency admin e.g. '0x123...abc'`),
})
export type AddEmergencyAdminActionParams = z.infer<typeof AddEmergencyAdminActionParamsSchema>

export type AddEmergencyAdminData = {
  params: AddEmergencyAdminActionParams
  signer: Record<string, InfinitWallet>
}

export class AddEmergencyAdminAction extends Action<AddEmergencyAdminData, AaveV3Registry> {
  constructor(data: AddEmergencyAdminData) {
    validateActionData(data, AddEmergencyAdminActionParamsSchema, ['aclAdmin'])
    super(AddEmergencyAdminAction.name, data)
  }
  protected getSubActions(registry: AaveV3Registry): SubAction[] {
    if (!registry.aclManager) {
      throw new ValidateInputValueError('registry: aclManager not found')
    }
    const aclAdmin = this.data.signer['aclAdmin']
    const params = this.data.params

    const addRiskAdminParams: AddEmergencyAdminSubActionParams = {
      aclManager: registry.aclManager,
      emergencyAdmin: params.emergencyAdmin,
    }
    return [new AddEmergencyAdminSubAction(aclAdmin, addRiskAdminParams)]
  }
}
