import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  SetDataFeedProxiesTxBuilder,
  SetDataFeedProxiesTxBuilderParams,
} from '@actions/subactions/tx-builders/LsdApi3ProxyOracleReader/setDataFeedProxies'

import { InitCapitalRegistry } from '@/src/type'

export type SetLsdApi3ProxyOracleReaderDataFeedProxiesSubActionParams = SetDataFeedProxiesTxBuilderParams

export class SetLsdApi3ProxyOracleReaderDataFeedProxiesSubAction extends SubAction<
  SetLsdApi3ProxyOracleReaderDataFeedProxiesSubActionParams,
  InitCapitalRegistry,
  object
> {
  constructor(client: InfinitWallet, params: SetLsdApi3ProxyOracleReaderDataFeedProxiesSubActionParams) {
    super(SetLsdApi3ProxyOracleReaderDataFeedProxiesSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilderParams: SetLsdApi3ProxyOracleReaderDataFeedProxiesSubActionParams = {
      lsdApi3ProxyOracleReader: this.params.lsdApi3ProxyOracleReader,
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
