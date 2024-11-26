import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  SetMaxStaleTimesTxBuilder,
  SetMaxStaleTimesTxBuilderParams,
} from '@actions/subactions/tx-builders/LsdApi3ProxyOracleReader/setMaxStaleTimes'

import { InitCapitalRegistry } from '@/src/type'

export type SetLsdApi3ProxyOracleReaderMaxStaleTimesSubActionParams = SetMaxStaleTimesTxBuilderParams

export class SetLsdApi3ProxyOracleReaderMaxStaleTimesSubAction extends SubAction<
  SetLsdApi3ProxyOracleReaderMaxStaleTimesSubActionParams,
  InitCapitalRegistry,
  object
> {
  constructor(client: InfinitWallet, params: SetLsdApi3ProxyOracleReaderMaxStaleTimesSubActionParams) {
    super(SetLsdApi3ProxyOracleReaderMaxStaleTimesSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilderParams: SetLsdApi3ProxyOracleReaderMaxStaleTimesSubActionParams = {
      lsdApi3ProxyOracleReader: this.params.lsdApi3ProxyOracleReader,
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
