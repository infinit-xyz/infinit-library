import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetAssetSourcesTxBuilder, SetAssetSourcesTxBuilderParams } from '@actions/subactions/tx-builders/aaveOracle/setAssetSources'

import { AaveV3Registry } from '@/src/type'

export type SetAssetOracleSourcesSubActionParams = SetAssetSourcesTxBuilderParams

export class SetAssetOracleSourcesSubAction extends SubAction<SetAssetOracleSourcesSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: SetAssetOracleSourcesSubActionParams) {
    super(SetAssetOracleSourcesSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // build setup asset sources Tx
    const setAssetSourcesParams: SetAssetSourcesTxBuilderParams = {
      oracle: this.params.oracle,
      assets: this.params.assets,
      sources: this.params.sources,
    }
    const setOracleTx = new SetAssetSourcesTxBuilder(this.client, setAssetSourcesParams)
    this.txBuilders.push(setOracleTx)
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    // no new address, do nothing
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
