import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import '@actions/subactions/tx-builders/Config/setModeStatus'
import { SetModeStatusTxBuilder, SetModeStatusTxBuilderParams } from '@actions/subactions/tx-builders/Config/setModeStatus'

import { InitCapitalRegistry } from '@/src/type'

export type SetModeStatusSubActionParams = {
  config: Address
  modeStatuses: Omit<SetModeStatusTxBuilderParams, 'config'>[]
}

export class SetModeStatusSubAction extends SubAction<SetModeStatusSubActionParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: SetModeStatusSubActionParams) {
    super(SetModeStatusSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const modeStatus of this.params.modeStatuses) {
      const txBuilderParams: SetModeStatusTxBuilderParams = {
        config: this.params.config,
        mode: modeStatus.mode,
        status: modeStatus.status,
      }
      this.txBuilders.push(new SetModeStatusTxBuilder(this.client, txBuilderParams))
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
