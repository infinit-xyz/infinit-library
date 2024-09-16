import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  RemoveAssetListingAdminParams,
  RemoveAssetListingAdminTxBuilder,
} from '@actions/subactions/tx-builders/aclManager/removeAssetListingAdmin'

import { AaveV3Registry } from '@/src/type'

export type RemoveAssetListingAdminSubActionParams = RemoveAssetListingAdminParams

export class RemoveAssetListingAdminSubAction extends SubAction<RemoveAssetListingAdminSubActionParams, AaveV3Registry, Object> {
  constructor(client: InfinitWallet, params: RemoveAssetListingAdminSubActionParams) {
    super(RemoveAssetListingAdminSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add new risk admin
    const txBuilder = new RemoveAssetListingAdminTxBuilder(this.client, this.params)
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
