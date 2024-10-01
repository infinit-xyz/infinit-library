import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetEmissionAdminParams, SetEmissionAdminTxBuilder } from '@actions/subactions/tx-builders/emissionManager/setEmissionAdmin'

import { AaveV3Registry } from '@/src/type'

export type SetEmissionAdminSubActionParams = SetEmissionAdminParams

export class SetEmissionAdminSubAction extends SubAction<SetEmissionAdminSubActionParams, object, object> {
  constructor(client: InfinitWallet, params: SetEmissionAdminSubActionParams) {
    super(SetEmissionAdminSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(new SetEmissionAdminTxBuilder(this.client, this.params))
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
