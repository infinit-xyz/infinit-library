import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import '@actions/subactions/tx-builders/Config/setModeStatus'
import {
  SetModeDebtCeilingInfoTxBuilder,
  SetModeDebtCeilingInfoTxBuilderParams,
} from '@actions/subactions/tx-builders/RiskManager/setModeDebtCeilingInfo'

import { InitCapitalRegistry } from '@/src/type'

export type SetModeDebtCeilingInfoSubActionParams = SetModeDebtCeilingInfoTxBuilderParams

export class SetModeStatusSubAction extends SubAction<SetModeDebtCeilingInfoSubActionParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: SetModeDebtCeilingInfoSubActionParams) {
    super(SetModeStatusSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilderParams: SetModeDebtCeilingInfoTxBuilderParams = {
      riskManager: this.params.riskManager,
      mode: this.params.mode,
      pools: this.params.pools,
      ceilAmts: this.params.ceilAmts,
    }
    this.txBuilders.push(new SetModeDebtCeilingInfoTxBuilder(this.client, txBuilderParams))
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
