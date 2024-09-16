import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetPoolPauseTxBuilder, SetPoolPauseTxBuilderParams } from '@actions/subactions/tx-builders/poolConfigurator/setPoolPause'

import { AaveV3Registry } from '@/src/type'

export class SetPoolPauseSubAction extends SubAction<SetPoolPauseTxBuilderParams, Object, Object> {
  constructor(client: InfinitWallet, params: SetPoolPauseTxBuilderParams) {
    super(SetPoolPauseSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new SetPoolPauseTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: AaveV3Registry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<AaveV3Registry, {}>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
