import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetMaxCollWLpCountTxBuilder, SetMaxCollWLpCountTxBuilderParams } from '@actions/subactions/tx-builders/Config/setMaxCollWLpCount'

import { InitCapitalRegistry } from '@/src/type'

export type SetMaxCollWLpCountSubActionParams = {
  config: Address
  modeMaxCollWLpCount: Omit<SetMaxCollWLpCountTxBuilderParams, 'config'>[]
}

export class SetMaxCollWLpCountSubAction extends SubAction<SetMaxCollWLpCountSubActionParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: SetMaxCollWLpCountSubActionParams) {
    super(SetMaxCollWLpCountSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const modeStatus of this.params.modeMaxCollWLpCount) {
      const txBuilderParams: SetMaxCollWLpCountTxBuilderParams = {
        config: this.params.config,
        mode: modeStatus.mode,
        maxCollWLpCount: modeStatus.maxCollWLpCount,
      }
      this.txBuilders.push(new SetMaxCollWLpCountTxBuilder(this.client, txBuilderParams))
    }
  }

  protected async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
