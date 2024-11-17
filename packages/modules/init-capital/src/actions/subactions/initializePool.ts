import _ from 'lodash'

import { Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { TxNotFoundError } from '@infinit-xyz/core/errors'

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
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry>> {
    // the txHashes should have at least one txHash
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // add new lending pool's irm and underlying token to the registry
    _.set(registry, ['lendingPools', this.params.name, 'underlyingToken'], this.params.underlingToken)
    _.set(registry, ['lendingPools', this.params.name, 'irm'], this.params.irm)

    return { newRegistry: registry, newMessage: {} }
  }
}
