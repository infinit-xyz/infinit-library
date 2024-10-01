import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { EnableFeeAmountTxBuilder } from '@/src/actions/subactions/tx-builders/UniswapV3Factory/enableFeeAmount'
import { UniswapV3Registry } from '@/src/type'

export type FeeAmount = {
  fee: number
  tickSpacing: number
}

export type EnableFeeAmountsSubActionParams = {
  uniswapV3Factory: Address
  feeAmounts: FeeAmount[]
}

export class EnableFeeAmountsSubAction extends SubAction<EnableFeeAmountsSubActionParams, UniswapV3Registry> {
  constructor(client: InfinitWallet, params: EnableFeeAmountsSubActionParams) {
    super(EnableFeeAmountsSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const feeAmount of this.params.feeAmounts) {
      this.txBuilders.push(
        new EnableFeeAmountTxBuilder(this.client, {
          factory: this.params.uniswapV3Factory,
          fee: feeAmount.fee,
          tickSpacing: feeAmount.tickSpacing,
        }),
      )
    }
  }

  public async updateRegistryAndMessage(
    registry: UniswapV3Registry,
    _txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<UniswapV3Registry, object>> {
    return { newRegistry: registry, newMessage: {} }
  }
}
