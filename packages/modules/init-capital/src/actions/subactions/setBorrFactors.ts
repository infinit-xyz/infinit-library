import { Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetBorrFactorE18TxBuilder, SetBorrFactorE18TxBuilderParams } from '@actions/subactions/tx-builders/Config/setBorrFactors_e18'

import { InitCapitalRegistry } from '@/src/type'

export type SetBorrFactorsSubActionParams = SetBorrFactorE18TxBuilderParams

export class SetBorrFactorsSubAction extends SubAction<SetBorrFactorsSubActionParams, InitCapitalRegistry> {
  constructor(client: InfinitWallet, params: SetBorrFactorsSubActionParams) {
    super(SetBorrFactorsSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- set mode pools borrow factors -----------
    this.txBuilders.push(
      new SetBorrFactorE18TxBuilder(this.client, {
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
