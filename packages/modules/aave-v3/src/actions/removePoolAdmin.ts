import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { RemovePoolAdminSubAction, RemovePoolAdminSubActionParams } from '@actions/subactions/removePoolAdmin'

import { AaveV3Registry } from '@/src/type'

export const RemovePoolAdminActionParamsSchema = z.object({
  aclManager: zodAddress.describe(`The address of the ACL manager contract e.g. '0x123...abc'`),
  poolAdmin: zodAddress.describe(`Address of the pool admin, managing lending pool settings e.g. '0x123...abc'`),
}) satisfies z.ZodType<RemovePoolAdminSubActionParams>

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

  protected getSubActions(): SubAction[] {
    const aclAdmin = this.data.signer['aclAdmin']
    const params = this.data.params

    const removePoolAdminParams: RemovePoolAdminSubActionParams = {
      aclManager: params.aclManager,
      poolAdmin: params.poolAdmin,
    }
    return [new RemovePoolAdminSubAction(aclAdmin, removePoolAdminParams)]
  }
}
