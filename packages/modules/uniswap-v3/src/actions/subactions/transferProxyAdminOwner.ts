import { Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { TransferOwnerTxBuilder, TransferOwnerTxBuilderParams } from '@/src/actions/subactions/tx-builders/ProxyAdmin/transferOwner'
import { UniswapV3Registry } from '@/src/type'

export type TransferProxyAdminOwnerSubActionParams = TransferOwnerTxBuilderParams

export class TransferProxyAdminOwnerSubAction extends SubAction<TransferProxyAdminOwnerSubActionParams, UniswapV3Registry, object> {
  constructor(client: InfinitWallet, params: TransferProxyAdminOwnerSubActionParams) {
    super(TransferProxyAdminOwnerSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(
      new TransferOwnerTxBuilder(this.client, {
        proxyAdmin: this.params.proxyAdmin,
        newOwner: this.params.newOwner,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: UniswapV3Registry,
    _txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<UniswapV3Registry, object>> {
    return { newRegistry: registry, newMessage: {} }
  }
}
