import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployNonfungibleTokenPositionDescriptorTxBuilder } from '@/src/actions/subactions/tx-builders/NonfungibleTokenPositionDescriptor/deploy'
import { DeployQuoterV2TxBuilder } from '@/src/actions/subactions/tx-builders/QuoterV2/deploy'
import { UniswapV3Registry } from '@/src/type'

export type DeployUniswapV3Params2 = {
  uniswapV3Factory: Address
  weth9: Address
  nftDescriptor: Address
  nativeCurrencyLabel: string
}

export type DeployUniswapV3Msg2 = {
  quoterV2: Address
  nonfungibleTokenPositionDescriptorImpl: Address
}

export class DeployUniswapV3Contracts2SubAction extends SubAction<DeployUniswapV3Params2, UniswapV3Registry, DeployUniswapV3Msg2> {
  constructor(client: InfinitWallet, params: DeployUniswapV3Params2) {
    super(DeployUniswapV3Contracts2SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(new DeployQuoterV2TxBuilder(this.client, { factory: this.params.uniswapV3Factory, weth9: this.params.weth9 }))
    this.txBuilders.push(
      new DeployNonfungibleTokenPositionDescriptorTxBuilder(this.client, {
        weth9: this.params.weth9,
        nativeCurrencyLabel: this.params.nativeCurrencyLabel,
        nftDescriptor: this.params.nftDescriptor,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: UniswapV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<UniswapV3Registry, DeployUniswapV3Msg2>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployQuoterV2Hash, deployNonfungiblePositionManagerImplHash] = txHashes

    const { contractAddress: quoterV2 } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployQuoterV2Hash })
    if (!quoterV2) {
      throw new ContractNotFoundError(deployQuoterV2Hash, 'QuoterV2')
    }
    registry['quoterV2'] = quoterV2

    const { contractAddress: nonfungibleTokenPositionDescriptorImpl } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployNonfungiblePositionManagerImplHash,
    })
    if (!nonfungibleTokenPositionDescriptorImpl) {
      throw new ContractNotFoundError(deployNonfungiblePositionManagerImplHash, 'NonfungibleTokenPositionDescriptorImpl')
    }
    registry['nonfungibleTokenPositionDescriptorImpl'] = nonfungibleTokenPositionDescriptorImpl

    const newMessage: DeployUniswapV3Msg2 = {
      quoterV2,
      nonfungibleTokenPositionDescriptorImpl,
    }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
