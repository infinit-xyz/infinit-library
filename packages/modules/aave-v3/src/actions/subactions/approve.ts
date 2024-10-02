import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { ApproveTxBuilder, ApproveTxBuilderParams } from '@actions/subactions/tx-builders/erc20/approve'

import { AaveV3Registry } from '@/src/type'

export type ApproveSubActionParams = ApproveTxBuilderParams

export class ApproveSubAction extends SubAction<ApproveSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: ApproveSubActionParams) {
    super(ApproveSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // approve
    const txBuilder = new ApproveTxBuilder(this.client, this.params)
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
