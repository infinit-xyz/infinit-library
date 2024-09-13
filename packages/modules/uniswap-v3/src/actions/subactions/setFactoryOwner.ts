import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetOwnerTxBuilder } from '@/src/actions/subactions/tx-builders/UniswapV3Factory/setOwner'
import { UniswapV3Registry } from '@/src/type'

export type SetFactoryOwnerSubActionParams = {
  uniswapV3Factory: Address
  newOwner: Address
}

export class SetFactoryOwnerSubAction extends SubAction<SetFactoryOwnerSubActionParams, UniswapV3Registry, Object> {
  constructor(client: InfinitWallet, params: SetFactoryOwnerSubActionParams) {
    super(SetFactoryOwnerSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(
      new SetOwnerTxBuilder(this.client, {
        factory: this.params.uniswapV3Factory,
        newOwner: this.params.newOwner,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: UniswapV3Registry,
    _txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<UniswapV3Registry, Object>> {
    return { newRegistry: registry, newMessage: {} }
  }
}
