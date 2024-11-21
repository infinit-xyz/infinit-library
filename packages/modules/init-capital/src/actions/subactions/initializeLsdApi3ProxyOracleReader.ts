import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { InitializeLsdApi3ProxyOracleReaderTxBuilder } from '@actions/subactions/tx-builders/LsdApi3ProxyOracleReader/initialize'

import { InitCapitalRegistry } from '@/src/type'

export type InitializeLsdApi3ProxyOracleReaderSubActionParams = {
  lsdApi3ProxyOracleReaderProxy: Address
  api3ProxyOracleReader: Address
}

export class InitializeLsdApi3ProxyOracleReaderSubAction extends SubAction<
  InitializeLsdApi3ProxyOracleReaderSubActionParams,
  InitCapitalRegistry
> {
  constructor(client: InfinitWallet, params: InitializeLsdApi3ProxyOracleReaderSubActionParams) {
    super(InitializeLsdApi3ProxyOracleReaderSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- initialize -----------
    // initialize lsd api3 proxy oracle reader
    this.txBuilders.push(
      new InitializeLsdApi3ProxyOracleReaderTxBuilder(this.client, {
        lsdApi3ProxyOracleReaderProxy: this.params.lsdApi3ProxyOracleReaderProxy,
        api3ProxyOracleReader: this.params.api3ProxyOracleReader,
      }),
    )
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
