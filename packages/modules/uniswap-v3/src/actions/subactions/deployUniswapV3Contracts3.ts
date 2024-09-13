import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeploySwapRouter02TxBuilder } from '@/src/actions/subactions/tx-builders/SwapRouter02/deploy'
import { DeployUniswapV3StakerTxBuilder } from '@/src/actions/subactions/tx-builders/UniswapV3Staker/deploy'
import { UniswapV3Registry } from '@/src/type'

export type DeployUniswapV3Params3 = {
  uniswapV2Factory: Address
  uniswapV3Factory: Address
  nonfungiblePositionManager: Address
  weth9: Address
  maxIncentiveStartLeadTime: bigint
  maxIncentiveDuration: bigint
}

export class DeployUniswapV3Contract3SubAction extends SubAction<DeployUniswapV3Params3, UniswapV3Registry, Object> {
  constructor(client: InfinitWallet, params: DeployUniswapV3Params3) {
    super(DeployUniswapV3Contract3SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(
      new DeploySwapRouter02TxBuilder(this.client, {
        factoryV2: this.params.uniswapV2Factory,
        factoryV3: this.params.uniswapV3Factory,
        positionManager: this.params.nonfungiblePositionManager,
        weth9: this.params.weth9,
      }),
      new DeployUniswapV3StakerTxBuilder(this.client, {
        factory: this.params.uniswapV3Factory,
        nonfungiblePositionManager: this.params.nonfungiblePositionManager,
        maxIncentiveStartLeadTime: this.params.maxIncentiveStartLeadTime,
        maxIncentiveDuration: this.params.maxIncentiveDuration,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: UniswapV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<UniswapV3Registry, Object>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deploySwapRouter02Hash, deployUniswapV3StakerHash] = txHashes

    const { contractAddress: swapRouter02 } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deploySwapRouter02Hash,
    })
    if (!swapRouter02) {
      throw new ContractNotFoundError(deploySwapRouter02Hash, 'SwapRouter02')
    }
    registry['swapRouter02'] = swapRouter02

    const { contractAddress: uniswapV3Staker } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployUniswapV3StakerHash,
    })
    if (!uniswapV3Staker) {
      throw new ContractNotFoundError(deployUniswapV3StakerHash, 'UniswapV3Staker')
    }
    registry['uniswapV3Staker'] = uniswapV3Staker

    return { newRegistry: registry, newMessage: {} }
  }
}
