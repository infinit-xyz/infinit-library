import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployNFTDescriptorTxBuilder } from '@/src/actions/subactions/tx-builders/NFTDescriptor/deploy'
import { DeployProxyAdminTxBuilder } from '@/src/actions/subactions/tx-builders/ProxyAdmin/deploy'
import { DeployTickLensTxBuilder } from '@/src/actions/subactions/tx-builders/TickLens/deploy'
import { DeployUniswapV3FactoryTxBuilder } from '@/src/actions/subactions/tx-builders/UniswapV3Factory/deploy'
import { UniswapV3Registry } from '@/src/type'

export type DeployUniswapV3Params = {}

export type DeployUniswapV3Msg = {
  uniswapV3Factory: Address
  nftDescriptor: Address
  tickLens: Address
  proxyAdmin: Address
}

export class DeployUniswapV3Contracts1SubAction extends SubAction<DeployUniswapV3Params, UniswapV3Registry, DeployUniswapV3Msg> {
  constructor(client: InfinitWallet, params: DeployUniswapV3Params) {
    super(DeployUniswapV3Contracts1SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- Core -----------
    this.txBuilders.push(new DeployUniswapV3FactoryTxBuilder(this.client))
    // ----------- Libraries -----------
    this.txBuilders.push(new DeployNFTDescriptorTxBuilder(this.client))
    // ----------- Helpers -----------
    this.txBuilders.push(new DeployTickLensTxBuilder(this.client))
    // ----------- Proxy Admin -----------
    this.txBuilders.push(new DeployProxyAdminTxBuilder(this.client))
  }

  public async updateRegistryAndMessage(
    registry: UniswapV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<UniswapV3Registry, DeployUniswapV3Msg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployUniswapV3FactoryHash, deployNFTDescriptorHash, deployTickLensHash, deployProxyAdminHash] = txHashes

    const { contractAddress: uniswapV3Factory } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployUniswapV3FactoryHash,
    })
    if (!uniswapV3Factory) {
      throw new Error('uniswapV3Factory not found')
    }
    registry['uniswapV3Factory'] = uniswapV3Factory

    const { contractAddress: nftDescriptor } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployNFTDescriptorHash })
    if (!nftDescriptor) {
      throw new Error('nftDescriptor not found')
    }
    registry['nftDescriptor'] = nftDescriptor

    const { contractAddress: tickLens } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployTickLensHash })
    if (!tickLens) {
      throw new Error('tickLens not found')
    }
    registry['tickLens'] = tickLens

    const { contractAddress: proxyAdmin } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployProxyAdminHash })
    if (!proxyAdmin) {
      throw new Error('proxyAdmin not found')
    }
    registry['proxyAdmin'] = proxyAdmin

    const newMessage: DeployUniswapV3Msg = {
      uniswapV3Factory,
      nftDescriptor,
      tickLens,
      proxyAdmin,
    }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
