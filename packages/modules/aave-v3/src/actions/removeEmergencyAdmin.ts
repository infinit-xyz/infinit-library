import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { RemoveEmergencyAdminSubAction, RemoveEmergencyAdminSubActionParams } from '@actions/subactions/removeEmegencyAdmin'

import { AaveV3Registry } from '@/src/type'

export const RemoveEmergencyAdminActionParamsSchema = z.object({
  emergencyAdmin: zodAddress.describe(`The address of the emergency admin e.g. '0x123...abc'`),
})

export type RemoveEmergencyAdminActionParams = z.infer<typeof RemoveEmergencyAdminActionParamsSchema>

export type RemoveEmergencyAdminData = {
  params: RemoveEmergencyAdminActionParams
  signer: Record<string, InfinitWallet>
}

export class RemoveEmergencyAdminAction extends Action<RemoveEmergencyAdminData, AaveV3Registry> {
  constructor(data: RemoveEmergencyAdminData) {
    validateActionData(data, RemoveEmergencyAdminActionParamsSchema, ['aclAdmin'])
    super(RemoveEmergencyAdminAction.name, data)
  }
  protected getSubActions(registry: AaveV3Registry): SubAction[] {
    if (!registry.aclManager) {
      throw new ValidateInputValueError('registry: aclManager not found')
    }
    const aclAdmin = this.data.signer['aclAdmin']
    const params = this.data.params

    const removeEmergencyAdminParams: RemoveEmergencyAdminSubActionParams = {
      aclManager: registry.aclManager,
      emergencyAdmin: params.emergencyAdmin,
    }
    return [new RemoveEmergencyAdminSubAction(aclAdmin, removeEmergencyAdminParams)]
  }
}
