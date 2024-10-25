import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetOracleTxBuilder, SetOracleTxBuilderParams } from '@actions/subactions/tx-builders/InitCore/setOracle'

import { InitCapitalRegistry } from '@/src/type'

export class SetOracleSubAction extends SubAction<SetOracleTxBuilderParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: SetOracleTxBuilderParams) {
    super(SetOracleSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(new SetOracleTxBuilder(this.client, this.params))
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
