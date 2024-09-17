import { Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeploySwapRouter02TxBuilder, DeploySwapRouter02TxBuilderParams } from '@/src/actions/subactions/tx-builders/SwapRouter02/deploy'
import { UniswapV3Registry } from '@/src/type'

export type DeployUniswapV3Params3 = DeploySwapRouter02TxBuilderParams

export class DeploySwapRouter02SubAction extends SubAction<DeployUniswapV3Params3, UniswapV3Registry, Object> {
  constructor(client: InfinitWallet, params: DeployUniswapV3Params3) {
    super(DeploySwapRouter02SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(new DeploySwapRouter02TxBuilder(this.client, this.params))
  }

  public async updateRegistryAndMessage(
    registry: UniswapV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<UniswapV3Registry, Object>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deploySwapRouter02Hash] = txHashes

    const { contractAddress: swapRouter02 } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deploySwapRouter02Hash,
    })
    if (!swapRouter02) {
      throw new ContractNotFoundError(deploySwapRouter02Hash, 'SwapRouter02')
    }
    registry['swapRouter02'] = swapRouter02

    return { newRegistry: registry, newMessage: {} }
  }
}
