import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { RemoveEmergencyAdminParams, RemoveEmergencyAdminTxBuilder } from '@actions/subactions/tx-builders/aclManager/removeEmergencyAdmin'

import { AaveV3Registry } from '@/src/type'

export type RemoveEmergencyAdminSubActionParams = RemoveEmergencyAdminParams

export class RemoveEmergencyAdminSubAction extends SubAction<RemoveEmergencyAdminSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: RemoveEmergencyAdminSubActionParams) {
    super(RemoveEmergencyAdminSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add new risk admin
    const txBuilder = new RemoveEmergencyAdminTxBuilder(this.client, this.params)
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
