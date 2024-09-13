import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployNonfungiblePositionManagerTxBuilder } from '@/src/actions/subactions/tx-builders/NonfungiblePositionManager/deploy'
import { UniswapV3Registry } from '@/src/type'

export type DeployNonfungiblePositionManagerParams = {
  uniswapV3Factory: Address
  weth9: Address
  nftDescriptor: Address
}

export type DeployNonfungiblePositionManagerMsg = {
  nonfungiblePositionManager: Address
}

export class DeployNonfungiblePositionManagerSubAction extends SubAction<
  DeployNonfungiblePositionManagerParams,
  UniswapV3Registry,
  DeployNonfungiblePositionManagerMsg
> {
  constructor(client: InfinitWallet, params: DeployNonfungiblePositionManagerParams) {
    super(DeployNonfungiblePositionManagerSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(
      new DeployNonfungiblePositionManagerTxBuilder(this.client, {
        factory: this.params.uniswapV3Factory,
        weth9: this.params.weth9,
        tokenDescriptor: this.params.nftDescriptor,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: UniswapV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<UniswapV3Registry, DeployNonfungiblePositionManagerMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployTransparentUpgradeableProxyHash] = txHashes

    const { contractAddress: nonfungiblePositionManager } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployTransparentUpgradeableProxyHash,
    })
    if (!nonfungiblePositionManager) {
      throw new ContractNotFoundError(deployTransparentUpgradeableProxyHash, 'NonfungiblePositionManager')
    }
    registry['nonfungiblePositionManager'] = nonfungiblePositionManager

    const newMessage: DeployNonfungiblePositionManagerMsg = {
      nonfungiblePositionManager,
    }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
