import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { RemovePoolAdminParams, RemovePoolAdminTxBuilder } from '@actions/subactions/tx-builders/aclManager/removePoolAdmin'

import { AaveV3Registry } from '@/src/type'

export type RemovePoolAdminSubActionParams = RemovePoolAdminParams

export class RemovePoolAdminSubAction extends SubAction<RemovePoolAdminSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: RemovePoolAdminSubActionParams) {
    super(RemovePoolAdminSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add new risk admin
    const txBuilder = new RemovePoolAdminTxBuilder(this.client, this.params)
    this.txBuilders.push(txBuilder)
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    // no new address, do nothing
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
