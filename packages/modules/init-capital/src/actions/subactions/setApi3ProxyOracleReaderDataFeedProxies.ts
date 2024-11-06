import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  SetDataFeedProxiesTxBuilder,
  SetDataFeedProxiesTxBuilderParams,
} from '@actions/subactions/tx-builders/Api3ProxyOracleReader/setDataFeedProxies'

import { InitCapitalRegistry } from '@/src/type'

export type SetApi3ProxyOracleReaderDataFeedProxiesSubActionParams = SetDataFeedProxiesTxBuilderParams

export class SetApi3ProxyOracleReaderDataFeedProxiesSubAction extends SubAction<
  SetApi3ProxyOracleReaderDataFeedProxiesSubActionParams,
  InitCapitalRegistry,
  object
> {
  constructor(client: InfinitWallet, params: SetApi3ProxyOracleReaderDataFeedProxiesSubActionParams) {
    super(SetApi3ProxyOracleReaderDataFeedProxiesSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilderParams: SetApi3ProxyOracleReaderDataFeedProxiesSubActionParams = {
      api3ProxyOracleReader: this.params.api3ProxyOracleReader,
      tokens: this.params.tokens,
      dataFeedProxies: this.params.dataFeedProxies,
    }
    this.txBuilders.push(new SetDataFeedProxiesTxBuilder(this.client, txBuilderParams))
  }

  protected async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
