import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { InitCapitalRegistry } from '@/src/type'
import { BeginDefaultAdminTransferTxBuilder } from '@actions/subactions/tx-builders/AccessControlManager/beginDefaultAdminTransfer'

export type BeginDefaultAdminTransferSubActionParams = {
  accessControlManager: Address
  newOwner: Address
}

export type BeginDefaultAdminTransferMsg = {}

export class BeginDefaultAdminTransferSubAction extends SubAction<BeginDefaultAdminTransferSubActionParams, InitCapitalRegistry, BeginDefaultAdminTransferMsg> {
  constructor(client: InfinitWallet, params: BeginDefaultAdminTransferSubActionParams) {
    super(BeginDefaultAdminTransferSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- implementation -----------
    this.txBuilders.push(new BeginDefaultAdminTransferTxBuilder(this.client, {
      accessControlManager: this.params.accessControlManager,
      newOwner: this.params.newOwner
    }))
  }

  protected async updateRegistryAndMessage(registry: InitCapitalRegistry, _txHashes: Hex[]): Promise<SubActionExecuteResponse<InitCapitalRegistry>> {
    // no new address, do nothing
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
