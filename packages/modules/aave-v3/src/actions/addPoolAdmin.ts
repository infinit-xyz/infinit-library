import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { AddPoolAdminSubAction, AddPoolAdminSubActionParams } from '@actions/subactions/addPoolAdmin'

import { AaveV3Registry } from '@/src/type'

export const AddPoolAdminActionParamsSchema = z.object({
  poolAdmin: zodAddress.describe(`Address of the pool admin, managing lending pool settings e.g. '0x123...abc'`),
})

export type AddPoolAdminActionParams = z.infer<typeof AddPoolAdminActionParamsSchema>

export type AddPoolAdminData = {
  params: AddPoolAdminActionParams
  signer: Record<string, InfinitWallet>
}

export class AddPoolAdminAction extends Action<AddPoolAdminData, AaveV3Registry> {
  constructor(data: AddPoolAdminData) {
    validateActionData(data, AddPoolAdminActionParamsSchema, ['aclAdmin'])
    super(AddPoolAdminAction.name, data)
  }
  protected getSubActions(registry: AaveV3Registry): SubAction[] {
    if (!registry.aclManager) {
      throw new ValidateInputValueError('registry: aclManager not found')
    }

    const aclAdmin = this.data.signer['aclAdmin']
    const params = this.data.params

    const addPoolAdminParams: AddPoolAdminSubActionParams = {
      aclManager: registry.aclManager,
      poolAdmin: params.poolAdmin,
    }
    return [new AddPoolAdminSubAction(aclAdmin, addPoolAdminParams)]
  }
}
