import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { CollectProtocolTxBuilder } from '@/src/actions/subactions/tx-builders/UniswapV3Pool/collectProtocol'
import { UniswapV3Registry } from '@/src/type'

export type CollectProtocolSubActionParams = {
  recipient: Address
  pools: Address[]
}

export class CollectProtocolSubAction extends SubAction<CollectProtocolSubActionParams, UniswapV3Registry, object> {
  constructor(client: InfinitWallet, params: CollectProtocolSubActionParams) {
    super(CollectProtocolSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const pool of this.params.pools) {
      this.txBuilders.push(
        new CollectProtocolTxBuilder(this.client, {
          pool: pool,
          recipient: this.params.recipient,
        }),
      )
    }
  }

  public async updateRegistryAndMessage(
    registry: UniswapV3Registry,
    _txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<UniswapV3Registry, object>> {
    return { newRegistry: registry, newMessage: {} }
  }
}
