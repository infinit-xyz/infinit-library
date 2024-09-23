import { Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployUniswapV3StakerTxBuilder,
  DeployUniswapV3StakerTxBuilderParams,
} from '@/src/actions/subactions/tx-builders/UniswapV3Staker/deploy'
import { UniswapV3Registry } from '@/src/type'

export type DeployUniswapV3StakerSubActionParams = DeployUniswapV3StakerTxBuilderParams

export class DeployUniswapV3StakerSubAction extends SubAction<DeployUniswapV3StakerSubActionParams, UniswapV3Registry, Object> {
  constructor(client: InfinitWallet, params: DeployUniswapV3StakerSubActionParams) {
    super(DeployUniswapV3StakerSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(new DeployUniswapV3StakerTxBuilder(this.client, this.params))
  }

  public async updateRegistryAndMessage(
    registry: UniswapV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<UniswapV3Registry, Object>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployUniswapV3StakerHash] = txHashes

    const { contractAddress: uniswapV3Staker } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployUniswapV3StakerHash,
    })
    if (!uniswapV3Staker) {
      throw new ContractNotFoundError(deployUniswapV3StakerHash, 'UniswapV3Staker')
    }
    registry['uniswapV3Staker'] = uniswapV3Staker

    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
