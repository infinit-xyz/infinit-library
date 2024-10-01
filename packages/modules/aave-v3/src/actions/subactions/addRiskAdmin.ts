import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { AddRiskAdminACLManagerParams, AddRiskAdminACLManagerTxBuilder } from '@actions/subactions/tx-builders/aclManager/addRiskAdmin'

import { AaveV3Registry } from '@/src/type'

export type AddRiskAdminSubActionParams = AddRiskAdminACLManagerParams

export class AddRiskAdminSubAction extends SubAction<AddRiskAdminSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: AddRiskAdminSubActionParams) {
    super(AddRiskAdminSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add new risk admin
    const txBuilder = new AddRiskAdminACLManagerTxBuilder(this.client, this.params)
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
