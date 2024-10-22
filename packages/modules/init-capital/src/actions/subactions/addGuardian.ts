import { Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { AddGuardianTxBuilder, AddGuardianTxBuilderParams } from '@actions/subactions/tx-builders/AccessControlManager/addGuardian'

import { InitCapitalRegistry } from '@/src/type'

export type AddGuardianSubActionParams = AddGuardianTxBuilderParams
export type AddGuardianMsg = {}

export class AddGuardianSubAction extends SubAction<AddGuardianSubActionParams, InitCapitalRegistry, AddGuardianMsg> {
  constructor(client: InfinitWallet, params: AddGuardianSubActionParams) {
    super(AddGuardianSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- grant governor role -----------
    this.txBuilders.push(new AddGuardianTxBuilder(this.client, this.params))
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
