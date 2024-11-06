import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetPriceIdsTxBuilder, SetPriceIdsTxBuilderParams } from '@actions/subactions/tx-builders/PythOracleReader/setPriceIds'

import { InitCapitalRegistry } from '@/src/type'

export type SetPythOracleReaderPriceIdsSubActionParams = SetPriceIdsTxBuilderParams

export class SetPythOracleReaderPriceIdsSubAction extends SubAction<
  SetPythOracleReaderPriceIdsSubActionParams,
  InitCapitalRegistry,
  object
> {
  constructor(client: InfinitWallet, params: SetPythOracleReaderPriceIdsSubActionParams) {
    super(SetPythOracleReaderPriceIdsSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilderParams: SetPythOracleReaderPriceIdsSubActionParams = {
      pythOracleReader: this.params.pythOracleReader,
      tokens: this.params.tokens,
      priceIds: this.params.priceIds,
    }
    this.txBuilders.push(new SetPriceIdsTxBuilder(this.client, txBuilderParams))
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
