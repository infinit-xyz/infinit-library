import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { AddAssetListingAdminSubAction, AddAssetListingAdminSubActionParams } from '@actions/subactions/addAssetListingAdmin'

import { AaveV3Registry } from '@/src/type'

export const AddAssetListingAdminActionParamsSchema = z.object({
  assetListingAdmin: zodAddress.describe(`The address of the asset listing admin e.g. '0x123...abc'`),
})

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
  protected getSubActions(registry: AaveV3Registry): SubAction[] {
    if (!registry.aclManager) {
      throw new ValidateInputValueError('registry: aclManager not found')
    }
    const aclAdmin = this.data.signer['aclAdmin']
    const params = this.data.params

    // construct subactions params
    const addAssetListingAdminParams: AddAssetListingAdminSubActionParams = {
      aclManager: registry.aclManager,
      assetListingAdmin: params.assetListingAdmin,
    }
    return [new AddAssetListingAdminSubAction(aclAdmin, addAssetListingAdminParams)]
  }
}
