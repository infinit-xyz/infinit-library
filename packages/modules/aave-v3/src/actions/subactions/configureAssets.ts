import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { ConfigureAssetsParams, ConfigureAssetsTxBuilder } from '@actions/subactions/tx-builders/emissionManager/configureAssets'

import { AaveV3Registry } from '@/src/type'

export type ConfigureAssetSubActionParams = ConfigureAssetsParams

export class ConfigureAssetsSubAction extends SubAction<ConfigureAssetSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: ConfigureAssetSubActionParams) {
    super(ConfigureAssetsSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // configure assets
    const txBuilder = new ConfigureAssetsTxBuilder(this.client, this.params)
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
