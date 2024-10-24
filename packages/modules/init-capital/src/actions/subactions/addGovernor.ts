import { Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { AddGovernorTxBuilder, AddGovernorTxBuilderParams } from '@actions/subactions/tx-builders/AccessControlManager/addGovernor'

import { InitCapitalRegistry } from '@/src/type'

export type AddGovernorSubActionParams = AddGovernorTxBuilderParams
export type AddGovernorMsg = {}

export class AddGovernorSubAction extends SubAction<AddGovernorSubActionParams, InitCapitalRegistry, AddGovernorMsg> {
  constructor(client: InfinitWallet, params: AddGovernorSubActionParams) {
    super(AddGovernorSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- grant governor role -----------
    this.txBuilders.push(new AddGovernorTxBuilder(this.client, this.params))
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
