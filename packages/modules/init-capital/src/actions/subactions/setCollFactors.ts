import { Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetCollFactorE18TxBuilder, SetCollFactorE18TxBuilderParams } from '@actions/subactions/tx-builders/Config/setCollFactors_e18'

import { InitCapitalRegistry } from '@/src/type'

export type SetCollFactorsSubActionParams = SetCollFactorE18TxBuilderParams

export class SetCollFactorsSubAction extends SubAction<SetCollFactorsSubActionParams, InitCapitalRegistry> {
  constructor(client: InfinitWallet, params: SetCollFactorsSubActionParams) {
    super(SetCollFactorsSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- set mode pools borrow factors -----------
    this.txBuilders.push(
      new SetCollFactorE18TxBuilder(this.client, {
        config: this.params.config,
        mode: this.params.mode,
        pools: this.params.pools,
        factors_e18: this.params.factors_e18,
      }),
    )
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
