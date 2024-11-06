import { Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { InitializeLendingPoolTxBuilder, InitializeLendingPoolTxBuilderParams } from './tx-builders/LendingPool/initialize'
import { InitCapitalRegistry } from '@/src/type'

export type InitilizeLendingPoolSubActionParams = InitializeLendingPoolTxBuilderParams

export class InitializeLendingPoolSubAction extends SubAction<InitilizeLendingPoolSubActionParams, InitCapitalRegistry> {
  constructor(client: InfinitWallet, params: InitilizeLendingPoolSubActionParams) {
    super(InitializeLendingPoolSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- initialize -----------
    // initialize lending pool
    this.txBuilders.push(
      new InitializeLendingPoolTxBuilder(this.client, {
        lendingPool: this.params.lendingPool,
        underlingToken: this.params.underlingToken,
        name: this.params.name,
        symbol: this.params.symbol,
        irm: this.params.irm,
        reserveFactor: this.params.reserveFactor,
        treasury: this.params.treasury,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    _txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry>> {
    return { newRegistry: registry, newMessage: {} }
  }
}
