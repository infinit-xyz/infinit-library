import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  SetMaxStaleTimesTxBuilder,
  SetMaxStaleTimesTxBuilderParams,
} from '@actions/subactions/tx-builders/PythOracleReader/setMaxStaleTimes'

import { InitCapitalRegistry } from '@/src/type'

export type SetPythOracleReaderMaxStaleTimesSubActionParams = SetMaxStaleTimesTxBuilderParams

export class SetPythOracleReaderMaxStaleTimesSubAction extends SubAction<
  SetPythOracleReaderMaxStaleTimesSubActionParams,
  InitCapitalRegistry,
  object
> {
  constructor(client: InfinitWallet, params: SetPythOracleReaderMaxStaleTimesSubActionParams) {
    super(SetPythOracleReaderMaxStaleTimesSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilderParams: SetPythOracleReaderMaxStaleTimesSubActionParams = {
      pythOracleReader: this.params.pythOracleReader,
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
