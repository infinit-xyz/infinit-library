import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployTransparentUpgradeableProxyTxBuilder } from '@/src/actions/subactions/tx-builders/TransparentUpgradeableProxy/deploy'
import { UniswapV3Registry } from '@/src/type'

export type deployNonfungibleTokenPositionDescriptorParams = {
  proxyAdmin: Address
  nonfungibleTokenPositionDescriptorImpl: Address
}

export type DeployNonfungibleTokenPositionDescriptorMsg = {
  nonfungibleTokenPositionDescriptor: Address
}

export class DeployNonfungibleTokenPositionDescriptorSubAction extends SubAction<
  deployNonfungibleTokenPositionDescriptorParams,
  UniswapV3Registry,
  DeployNonfungibleTokenPositionDescriptorMsg
> {
  constructor(client: InfinitWallet, params: deployNonfungibleTokenPositionDescriptorParams) {
    super(DeployNonfungibleTokenPositionDescriptorSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(
      new DeployTransparentUpgradeableProxyTxBuilder(this.client, {
        logic: this.params.nonfungibleTokenPositionDescriptorImpl,
        admin: this.params.proxyAdmin,
        data: '0x',
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: UniswapV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<UniswapV3Registry, DeployNonfungibleTokenPositionDescriptorMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployNonfungibleTokenPositionDescriptorSubActionHash] = txHashes

    const { contractAddress: nonfungibleTokenPositionDescriptor } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployNonfungibleTokenPositionDescriptorSubActionHash,
    })
    if (!nonfungibleTokenPositionDescriptor) {
      throw new ContractNotFoundError(deployNonfungibleTokenPositionDescriptorSubActionHash, 'NonfungibleTokenPositionDescriptor')
    }
    registry['nonfungibleTokenPositionDescriptor'] = nonfungibleTokenPositionDescriptor

    const newMessage: DeployNonfungibleTokenPositionDescriptorMsg = {
      nonfungibleTokenPositionDescriptor,
    }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
