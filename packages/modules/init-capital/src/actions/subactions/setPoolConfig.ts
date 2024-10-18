import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetPoolConfigTxBuilder, SetPoolConfigTxBuilderParams } from '@actions/subActions/txBuilders/Config/setPoolConfig'
import '@actions/subactions/tx-builders/Config/setPoolConfig'

import { InitCapitalRegistry } from '@/src/type'

export type SetPoolConfigSubActionParams = {
  config: Address
  batchPoolConfigParams: Omit<SetPoolConfigTxBuilderParams, 'config'>[]
}

export class SetPoolConfigSubAction extends SubAction<SetPoolConfigSubActionParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: SetPoolConfigSubActionParams) {
    super(SetPoolConfigSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const poolConfigParams of this.params.batchPoolConfigParams) {
      const txBuilderParams: SetPoolConfigTxBuilderParams = {
        config: this.params.config,
        pool: poolConfigParams.pool,
        poolConfig: poolConfigParams.poolConfig,
      }
      this.txBuilders.push(new SetPoolConfigTxBuilder(this.client, txBuilderParams))
    }
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
