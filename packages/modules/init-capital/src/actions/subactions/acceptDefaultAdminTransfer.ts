import { Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  AcceptDefaultAdminTransferTxBuilder,
  AcceptDefaultAdminTransferTxBuilderParams,
} from '@actions/subactions/tx-builders/AccessControlManager/acceptDefaultAdminTransfer'

import { InitCapitalRegistry } from '@/src/type'

export type AcceptDefaultAdminTransferSubActionParams = AcceptDefaultAdminTransferTxBuilderParams
export type AcceptDefaultAdminTransferMsg = {}

export class AcceptDefaultAdminTransferSubAction extends SubAction<
  AcceptDefaultAdminTransferSubActionParams,
  InitCapitalRegistry,
  AcceptDefaultAdminTransferMsg
> {
  constructor(client: InfinitWallet, params: AcceptDefaultAdminTransferSubActionParams) {
    super(AcceptDefaultAdminTransferSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- grant governor role -----------
    this.txBuilders.push(new AcceptDefaultAdminTransferTxBuilder(this.client, this.params))
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
