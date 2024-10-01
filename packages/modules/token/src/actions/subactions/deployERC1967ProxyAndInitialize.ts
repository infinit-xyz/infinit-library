import _ from 'lodash'

import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import { DeployERC1967ProxyTxBuilder, DeployERC1967ProxyTxBuilderParams } from '@actions/subactions/txBuilders/ERC1967Proxy/deploy'

import { MerkleDistributor, TokenRegistry } from '@/src/type'

export type DeployERC1967ProxyAndInitializeSubActionParams = DeployERC1967ProxyTxBuilderParams

export class DeployERC1967ProxyAndInitializeSubAction extends SubAction<DeployERC1967ProxyAndInitializeSubActionParams, object, object> {
  constructor(client: InfinitWallet, params: DeployERC1967ProxyAndInitializeSubActionParams) {
    super(DeployERC1967ProxyAndInitializeSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const deployAccMerkleTxBuilderParams: DeployERC1967ProxyTxBuilderParams = {
      implementation: this.params.implementation,
      data: this.params.data,
    }
    this.txBuilders.push(new DeployERC1967ProxyTxBuilder(this.client, deployAccMerkleTxBuilderParams))
  }

  protected async updateRegistryAndMessage(registry: TokenRegistry, txHashes: Hash[]): Promise<SubActionExecuteResponse<TokenRegistry>> {
    const [deployERC1967Hash] = txHashes
    const { contractAddress: erc1967Address } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployERC1967Hash })
    if (!erc1967Address) {
      throw new ContractNotFoundError(deployERC1967Hash, 'ERC1967')
    }

    const merkleDistributor: MerkleDistributor = {
      implementation: this.params.implementation,
    }
    _.set(registry, ['accumulativeMerkleDistributors', erc1967Address], merkleDistributor)

    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
