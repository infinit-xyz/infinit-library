import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { RemoveRiskAdminParams, RemoveRiskAdminTxBuilder } from '@actions/subactions/tx-builders/aclManager/removeRiskAdmin'

import { AaveV3Registry } from '@/src/type'

export type RemoveRiskAdminSubActionParams = RemoveRiskAdminParams

export class RemoveRiskAdminSubAction extends SubAction<RemoveRiskAdminSubActionParams, AaveV3Registry, Object> {
  constructor(client: InfinitWallet, params: RemoveRiskAdminSubActionParams) {
    super(RemoveRiskAdminSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add new risk admin
    const txBuilder = new RemoveRiskAdminTxBuilder(this.client, this.params)
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
