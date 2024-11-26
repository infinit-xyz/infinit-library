import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  SetQuoteTokensTxBuilder,
  SetQuoteTokensTxBuilderParams,
} from '@actions/subactions/tx-builders/LsdApi3ProxyOracleReader/setQuoteTokens'

import { InitCapitalRegistry } from '@/src/type'

export type SetLsdApi3ProxyOracleReaderQuoteTokensSubActionParams = SetQuoteTokensTxBuilderParams

export class SetLsdApi3ProxyOracleReaderQuoteTokensSubAction extends SubAction<
  SetLsdApi3ProxyOracleReaderQuoteTokensSubActionParams,
  InitCapitalRegistry,
  object
> {
  constructor(client: InfinitWallet, params: SetLsdApi3ProxyOracleReaderQuoteTokensSubActionParams) {
    super(SetLsdApi3ProxyOracleReaderQuoteTokensSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilderParams: SetLsdApi3ProxyOracleReaderQuoteTokensSubActionParams = {
      lsdApi3ProxyOracleReader: this.params.lsdApi3ProxyOracleReader,
      tokens: this.params.tokens,
      quoteTokens: this.params.quoteTokens,
    }
    this.txBuilders.push(new SetQuoteTokensTxBuilder(this.client, txBuilderParams))
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
