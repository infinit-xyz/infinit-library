import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { InitializePythOracleReaderTxBuilder } from '@actions/subactions/tx-builders/PythOracleReader/initialize'

import { InitCapitalRegistry } from '@/src/type'

export type InitializePythOracleReaderSubActionParams = {
  pythOracleReaderProxy: Address
  pyth: Address
}

export class InitializePythOracleReaderSubAction extends SubAction<InitializePythOracleReaderSubActionParams, InitCapitalRegistry> {
  constructor(client: InfinitWallet, params: InitializePythOracleReaderSubActionParams) {
    super(InitializePythOracleReaderSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- initialize -----------
    // initialize init pyth oracle reader
    this.txBuilders.push(
      new InitializePythOracleReaderTxBuilder(this.client, { pythOracleReader: this.params.pythOracleReaderProxy, pyth: this.params.pyth }),
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
