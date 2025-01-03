import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { RemoveRiskAdminSubAction, RemoveRiskAdminSubActionParams } from '@actions/subactions/removeRiskAdmin'

import { AaveV3Registry } from '@/src/type'

export const RemoveRiskAdminActionParamsSchema = z.object({
  riskAdmin: zodAddress.describe(`The address of the risk admin e.g. '0x123...abc'`),
})

export type RemoveRiskAdminActionParams = z.infer<typeof RemoveRiskAdminActionParamsSchema>

export type RemoveRiskAdminData = {
  params: RemoveRiskAdminActionParams
  signer: Record<string, InfinitWallet>
}

export class RemoveRiskAdminAction extends Action<RemoveRiskAdminData, AaveV3Registry> {
  constructor(data: RemoveRiskAdminData) {
    validateActionData(data, RemoveRiskAdminActionParamsSchema, ['aclAdmin'])
    super(RemoveRiskAdminAction.name, data)
  }
  protected getSubActions(registry: AaveV3Registry): SubAction[] {
    if (!registry.aclManager) {
      throw new ValidateInputValueError('registry: aclManager not found')
    }
    const aclAdmin = this.data.signer['aclAdmin']
    const params = this.data.params

    const removeRiskAdminParams: RemoveRiskAdminSubActionParams = {
      aclManager: registry.aclManager,
      riskAdmin: params.riskAdmin,
    }

    return [new RemoveRiskAdminSubAction(aclAdmin, removeRiskAdminParams)]
  }
}
