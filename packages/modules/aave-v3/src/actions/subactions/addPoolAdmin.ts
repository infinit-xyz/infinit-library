import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { AddPoolAdminACLManagerParams, AddPoolAdminACLManagerTxBuilder } from '@actions/subactions/tx-builders/aclManager/addPoolAdmin'

import { AaveV3Registry } from '@/src/type'

export type AddPoolAdminSubActionParams = AddPoolAdminACLManagerParams

export class AddPoolAdminSubAction extends SubAction<AddPoolAdminSubActionParams, AaveV3Registry, Object> {
  constructor(client: InfinitWallet, params: AddPoolAdminSubActionParams) {
    super(AddPoolAdminSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add new risk admin
    const txBuilder = new AddPoolAdminACLManagerTxBuilder(this.client, this.params)
    this.txBuilders.push(txBuilder)
  }

  protected async updateRegistryAndMessage(
    registry: AaveV3Registry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<AaveV3Registry, {}>> {
    // no new address, do nothing
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
