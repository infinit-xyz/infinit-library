import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetModeStatusTxBuilder, SetModeStatusTxBuilderParams } from '@actions/subActions/txBuilders/Config/setModeStatus'
import '@actions/subactions/tx-builders/Config/SetModeStatus'

import { InitCapitalRegistry } from '@/src/type'

export type SetModeStatusesSubActionParams = {
  config: Address
  modeStatuses: Omit<SetModeStatusTxBuilderParams, 'config'>[]
}

export class SetModeStatusesSubAction extends SubAction<SetModeStatusesSubActionParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: SetModeStatusesSubActionParams) {
    super(SetModeStatusesSubAction.name, client, params)
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
