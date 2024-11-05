import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  SetMaxStaleTimesTxBuilder,
  SetMaxStaleTimesTxBuilderParams,
} from '@actions/subactions/tx-builders/Api3ProxyOracleReader/setMaxStaleTimes'

import { InitCapitalRegistry } from '@/src/type'

export type SetApi3ProxyOracleReaderMaxStaleTimesSubActionParams = SetMaxStaleTimesTxBuilderParams

export class SetApi3ProxyOracleReaderMaxStaleTimesSubAction extends SubAction<
  SetApi3ProxyOracleReaderMaxStaleTimesSubActionParams,
  InitCapitalRegistry,
  object
> {
  constructor(client: InfinitWallet, params: SetApi3ProxyOracleReaderMaxStaleTimesSubActionParams) {
    super(SetApi3ProxyOracleReaderMaxStaleTimesSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilderParams: SetApi3ProxyOracleReaderMaxStaleTimesSubActionParams = {
      api3ProxyOracleReader: this.params.api3ProxyOracleReader,
      tokens: this.params.tokens,
      maxStaleTimes: this.params.maxStaleTimes,
    }
    this.txBuilders.push(new SetMaxStaleTimesTxBuilder(this.client, txBuilderParams))
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
