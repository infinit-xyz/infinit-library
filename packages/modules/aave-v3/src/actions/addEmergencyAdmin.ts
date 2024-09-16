import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { AddEmergencyAdminSubAction, AddEmergencyAdminSubActionParams } from '@actions/subactions/addEmegencyAdmin'

import { AaveV3Registry } from '@/src/type'

export const AddEmergencyAdminActionParamsSchema = z.object({
  aclManager: zodAddress.describe(`The address of the ACL manager contract e.g. '0x123...abc'`),
  emergencyAdmin: zodAddress.describe(`The address of the emergency admin e.g. '0x123...abc'`),
}) satisfies z.ZodType<AddEmergencyAdminSubActionParams>

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
  protected getSubActions(): SubAction[] {
    const aclAdmin = this.data.signer['aclAdmin']
    const params = this.data.params

    const addRiskAdminParams: AddEmergencyAdminSubActionParams = {
      aclManager: params.aclManager,
      emergencyAdmin: params.emergencyAdmin,
    }
    return [new AddEmergencyAdminSubAction(aclAdmin, addRiskAdminParams)]
  }
}
