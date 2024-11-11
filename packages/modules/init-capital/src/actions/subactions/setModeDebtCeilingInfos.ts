import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import '@actions/subactions/tx-builders/Config/setModeStatus'
import {
  SetModeDebtCeilingInfoTxBuilder,
  SetModeDebtCeilingInfoTxBuilderParams,
} from '@actions/subactions/tx-builders/RiskManager/setModeDebtCeilingInfo'

import { InitCapitalRegistry } from '@/src/type'

export type SetModeDebtCeilingInfosSubActionParams = {
  riskManager: Address
  modeDebtCeilingInfos: Omit<SetModeDebtCeilingInfoTxBuilderParams, 'riskManager'>[]
}

export class SetModeDebtCeilingInfosSubAction extends SubAction<SetModeDebtCeilingInfosSubActionParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: SetModeDebtCeilingInfosSubActionParams) {
    super(SetModeDebtCeilingInfosSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const modeDebtCeilingInfo of this.params.modeDebtCeilingInfos) {
      const txBuilderParams: SetModeDebtCeilingInfoTxBuilderParams = {
        riskManager: this.params.riskManager,
        mode: modeDebtCeilingInfo.mode,
        pools: modeDebtCeilingInfo.pools,
        ceilAmts: modeDebtCeilingInfo.ceilAmts,
      }
      this.txBuilders.push(new SetModeDebtCeilingInfoTxBuilder(this.client, txBuilderParams))
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
