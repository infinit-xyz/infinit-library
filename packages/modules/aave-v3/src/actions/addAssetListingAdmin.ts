import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { AddAssetListingAdminSubAction, AddAssetListingAdminSubActionParams } from '@actions/subactions/addAssetListingAdmin'

import { AaveV3Registry } from '@/src/type'

export const AddAssetListingAdminActionParamsSchema = z.object({
  aclManager: zodAddress.describe(`The address of the ACL manager contract e.g. '0x123...abc'`),
  assetListingAdmin: zodAddress.describe(`The address of the asset listing admin e.g. '0x123...abc'`),
}) satisfies z.ZodType<AddAssetListingAdminSubActionParams>

export type AddAssetListingAdminActionParams = z.infer<typeof AddAssetListingAdminActionParamsSchema>

export type AddAssetListingAdminData = {
  params: AddAssetListingAdminActionParams
  signer: Record<string, InfinitWallet>
}

export class AddAssetListingAdminAction extends Action<AddAssetListingAdminData, AaveV3Registry> {
  constructor(data: AddAssetListingAdminData) {
    validateActionData(data, AddAssetListingAdminActionParamsSchema, ['aclAdmin'])
    super(AddAssetListingAdminAction.name, data)
  }
  protected getSubActions(): SubAction[] {
    const aclAdmin = this.data.signer['aclAdmin']
    const params = this.data.params

    // construct subactions params
    const addAssetListingAdminParams: AddAssetListingAdminSubActionParams = {
      aclManager: params.aclManager,
      assetListingAdmin: params.assetListingAdmin,
    }
    return [new AddAssetListingAdminSubAction(aclAdmin, addAssetListingAdminParams)]
  }
}
