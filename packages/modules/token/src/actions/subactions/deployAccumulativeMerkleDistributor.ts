import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployAccumulativeMerkleDistributorTxBuilder,
  DeployAccumulativeMerkleDistributorTxBuilderParams,
} from '@actions/subactions/txBuilders/AccumulativeMerkleDistributor/deploy'

import { TokenRegistry } from '@/src/type'

export type DeployAccumulativeMerkleDistributorSubActionParams = DeployAccumulativeMerkleDistributorTxBuilderParams

export type DeployAccumulativeMerkleDistributorSubActionMsg = {
  accMerkleDistributor: Address
}
export class DeployAccumulativeMerkleDistributorSubAction extends SubAction<
  DeployAccumulativeMerkleDistributorSubActionParams,
  TokenRegistry,
  Object
> {
  constructor(client: InfinitWallet, params: DeployAccumulativeMerkleDistributorSubActionParams) {
    super(DeployAccumulativeMerkleDistributorSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const deployAccMerkleTxBuilderParams: DeployAccumulativeMerkleDistributorTxBuilderParams = {
      token: this.params.token,
    }
    this.txBuilders.push(new DeployAccumulativeMerkleDistributorTxBuilder(this.client, deployAccMerkleTxBuilderParams))
  }

  protected async updateRegistryAndMessage(
    registry: TokenRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<TokenRegistry, {}>> {
    const [deployAccMerkleHash] = txHashes

    const { contractAddress: accMerkle } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployAccMerkleHash })
    if (!accMerkle) {
      throw new ContractNotFoundError(deployAccMerkleHash, 'AccumulativeMerkleDistributor')
    }

    return {
      newRegistry: registry,
      newMessage: {
        accMerkleDistributor: accMerkle,
      },
    }
  }
}
