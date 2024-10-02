import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { CreateIncentiveTxBuilder, IncentiveKey } from '@/src/actions/subactions/tx-builders/UniswapV3Staker/createIncentive'
import { UniswapV3Registry } from '@/src/type'

export type IncentiveInfo = {
  incentiveKey: IncentiveKey
  reward: bigint
}

export type CreateIncentivesSubActionParams = {
  uniswapV3Staker: Address
  incentiveInfos: IncentiveInfo[]
}

export class CreateIncentivesSubAction extends SubAction<CreateIncentivesSubActionParams, UniswapV3Registry, object> {
  constructor(client: InfinitWallet, params: CreateIncentivesSubActionParams) {
    super(CreateIncentivesSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const info of this.params.incentiveInfos) {
      this.txBuilders.push(
        new CreateIncentiveTxBuilder(this.client, {
          uniswapV3Staker: this.params.uniswapV3Staker,
          incentiveKey: info.incentiveKey,
          reward: info.reward,
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
