import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  AddEmergencyAdminACLManagerParams,
  AddEmergencyAdminACLManagerTxBuilder,
} from '@actions/subactions/tx-builders/aclManager/addEmergencyAdmin'

import { AaveV3Registry } from '@/src/type'

export type AddEmergencyAdminSubActionParams = AddEmergencyAdminACLManagerParams

export class AddEmergencyAdminSubAction extends SubAction<AddEmergencyAdminSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: AddEmergencyAdminSubActionParams) {
    super(AddEmergencyAdminSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add new risk admin
    const txBuilder = new AddEmergencyAdminACLManagerTxBuilder(this.client, this.params)
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
