import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { RemoveAssetListingAdminSubAction, RemoveAssetListingAdminSubActionParams } from '@actions/subactions/removeAssetListingAdmin'

import { AaveV3Registry } from '@/src/type'

export const RemoveAssetListingAdminActionParamsSchema = z.object({
  assetListingAdmin: zodAddress.describe(`The address of the asset listing admin e.g. '0x123...abc'`),
})

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

  protected getSubActions(registry: AaveV3Registry): SubAction[] {
    if (!registry.aclManager) {
      throw new ValidateInputValueError('registry: emissionManager not found')
    }
    const aclAdmin = this.data.signer['aclAdmin']
    const params = this.data.params

    const removeAssetListingAdminParams: RemoveAssetListingAdminSubActionParams = {
      aclManager: registry.aclManager,
      assetListingAdmin: params.assetListingAdmin,
    }
    return [new RemoveAssetListingAdminSubAction(aclAdmin, removeAssetListingAdminParams)]
  }
}
