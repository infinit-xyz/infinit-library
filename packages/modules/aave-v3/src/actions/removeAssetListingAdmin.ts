import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { RemoveAssetListingAdminSubAction, RemoveAssetListingAdminSubActionParams } from '@actions/subactions/removeAssetListingAdmin'

import { AaveV3Registry } from '@/src/type'

export const RemoveAssetListingAdminActionParamsSchema = z.object({
  aclManager: zodAddress.describe(`The address of the ACL manager contract e.g. '0x123...abc'`),
  assetListingAdmin: zodAddress.describe(`The address of the asset listing admin e.g. '0x123...abc'`),
}) satisfies z.ZodType<RemoveAssetListingAdminSubActionParams>

export type RemoveAssetListingAdminActionParams = z.infer<typeof RemoveAssetListingAdminActionParamsSchema>

export type RemoveAssetListingAdminData = {
  params: RemoveAssetListingAdminActionParams
  signer: Record<string, InfinitWallet>
}

export class RemoveAssetListingAdminAction extends Action<RemoveAssetListingAdminData, AaveV3Registry> {
  constructor(data: RemoveAssetListingAdminData) {
    validateActionData(data, RemoveAssetListingAdminActionParamsSchema, ['aclAdmin'])
    super(RemoveAssetListingAdminAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const aclAdmin = this.data.signer['aclAdmin']
    const params = this.data.params

    const removeAssetListingAdminParams: RemoveAssetListingAdminSubActionParams = {
      aclManager: params.aclManager,
      assetListingAdmin: params.assetListingAdmin,
    }
    return [new RemoveAssetListingAdminSubAction(aclAdmin, removeAssetListingAdminParams)]
  }
}
