import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { TransferOwnerTxBuilder } from '@actions/subactions/tx-builders/ProxyAdmin/transferOwner'

import { InitCapitalRegistry } from '@/src/type'

export type TransferProxyAdminOwnerSubActionParams = {
  proxyAdmin: Address
  newOwner: Address
}

export type TransferProxyAdminOwnerMsg = {}

export class TransferProxyAdminOwnerSubAction extends SubAction<
  TransferProxyAdminOwnerSubActionParams,
  InitCapitalRegistry,
  TransferProxyAdminOwnerMsg
> {
  constructor(client: InfinitWallet, params: TransferProxyAdminOwnerSubActionParams) {
    super(TransferProxyAdminOwnerSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- transferOwner -----------
    this.txBuilders.push(
      new TransferOwnerTxBuilder(this.client, {
        proxyAdmin: this.params.proxyAdmin,
        newOwner: this.params.newOwner,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    _txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry>> {
    // no new address, do nothing
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
