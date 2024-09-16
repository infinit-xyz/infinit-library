import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { AddAssetListingAdminParams, AddAssetListingAdminTxBuilder } from '@actions/subactions/tx-builders/aclManager/addAssetListingAdmin'

import { AaveV3Registry } from '@/src/type'

export type AddAssetListingAdminSubActionParams = AddAssetListingAdminParams

export class AddAssetListingAdminSubAction extends SubAction<AddAssetListingAdminSubActionParams, AaveV3Registry, Object> {
  constructor(client: InfinitWallet, params: AddAssetListingAdminSubActionParams) {
    super(AddAssetListingAdminSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add new risk admin
    const txBuilder = new AddAssetListingAdminTxBuilder(this.client, this.params)
    this.txBuilders.push(txBuilder)
  }

  protected async updateRegistryAndMessage(
    registry: AaveV3Registry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<AaveV3Registry, {}>> {
    // no new address, do nothing
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
