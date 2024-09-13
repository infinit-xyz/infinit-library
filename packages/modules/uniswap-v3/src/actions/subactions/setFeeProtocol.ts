import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetFeeProtocolTxBuilder, SetFeeProtocolTxBuilderParams } from '@/src/actions/subactions/tx-builders/UniswapV3Pool/setFeeProtocol'
import { UniswapV3Registry } from '@/src/type'

export type SetFeeProtocolSubActionParams = {
  uniswapV3Factory: Address
  feeProtocolInfos: SetFeeProtocolTxBuilderParams[]
}

export class SetFeeProtocolSubAction extends SubAction<SetFeeProtocolSubActionParams, UniswapV3Registry, Object> {
  constructor(client: InfinitWallet, params: SetFeeProtocolSubActionParams) {
    super(SetFeeProtocolSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const txBuilderParam of this.params.feeProtocolInfos) {
      this.txBuilders.push(new SetFeeProtocolTxBuilder(this.client, txBuilderParam))
    }
  }

  public async updateRegistryAndMessage(
    registry: UniswapV3Registry,
    _txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<UniswapV3Registry, Object>> {
    return { newRegistry: registry, newMessage: {} }
  }
}
