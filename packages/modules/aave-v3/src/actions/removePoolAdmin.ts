import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { RemovePoolAdminSubAction, RemovePoolAdminSubActionParams } from '@actions/subactions/removePoolAdmin'

import { AaveV3Registry } from '@/src/type'

export const RemovePoolAdminActionParamsSchema = z.object({
  poolAdmin: zodAddress.describe(`Address of the pool admin, managing lending pool settings e.g. '0x123...abc'`),
})

export type RemovePoolAdminActionParams = z.infer<typeof RemovePoolAdminActionParamsSchema>

export type RemovePoolAdminData = {
  params: RemovePoolAdminActionParams
  signer: Record<string, InfinitWallet>
}

export class RemovePoolAdminAction extends Action<RemovePoolAdminData, AaveV3Registry> {
  constructor(data: RemovePoolAdminData) {
    validateActionData(data, RemovePoolAdminActionParamsSchema, ['aclAdmin'])
    super(RemovePoolAdminAction.name, data)
  }

  protected getSubActions(registry: AaveV3Registry): SubAction[] {
    if (!registry.aclManager) {
      throw new ValidateInputValueError('registry: aclManager not found')
    }
    const aclAdmin = this.data.signer['aclAdmin']
    const params = this.data.params

    const removePoolAdminParams: RemovePoolAdminSubActionParams = {
      aclManager: registry.aclManager,
      poolAdmin: params.poolAdmin,
    }
    return [new RemovePoolAdminSubAction(aclAdmin, removePoolAdminParams)]
  }
}
