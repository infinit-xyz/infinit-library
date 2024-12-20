import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { AddRiskAdminSubAction, AddRiskAdminSubActionParams } from '@actions/subactions/addRiskAdmin'

import { AaveV3Registry } from '@/src/type'

export const AddRiskAdminActionParamsSchema = z.object({
  riskAdmin: zodAddress.describe(`The address of the risk admin e.g. '0x123...abc'`),
})

export type AddRiskAdminActionParams = z.infer<typeof AddRiskAdminActionParamsSchema>

export type AddRiskAdminData = {
  params: AddRiskAdminActionParams
  signer: Record<string, InfinitWallet>
}

export class AddRiskAdminAction extends Action<AddRiskAdminData, AaveV3Registry> {
  constructor(data: AddRiskAdminData) {
    validateActionData(data, AddRiskAdminActionParamsSchema, ['aclAdmin'])
    super(AddRiskAdminAction.name, data)
  }

  protected getSubActions(registry: AaveV3Registry): SubAction[] {
    if (!registry.aclManager) {
      throw new ValidateInputValueError('registry: aclManager not found')
    }

    const aclAdmin = this.data.signer['aclAdmin']
    const params = this.data.params

    const addRiskAdminParams: AddRiskAdminSubActionParams = {
      aclManager: registry.aclManager,
      riskAdmin: params.riskAdmin,
    }
    return [new AddRiskAdminSubAction(aclAdmin, addRiskAdminParams)]
  }
}
