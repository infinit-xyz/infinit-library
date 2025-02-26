import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import { DeployBaseSplitCodeFactoryContractTxBuilder } from '@actions/on-chain/subactions/txBuilders/BaseSplitCodeFactoryContract/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployBaseSplitCodeFactoryContractSubactionMsg = {
  baseSplitCodeFactoryContract: Address
}
export class DeployBaseSplitCodeFactoryContractSubaction extends SubAction<
  object,
  PendleRegistry,
  DeployBaseSplitCodeFactoryContractSubactionMsg
> {
  constructor(client: InfinitWallet) {
    super(DeployBaseSplitCodeFactoryContractSubaction.name, client, {})
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployBaseSplitCodeFactoryContractTxBuilder(this.client)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployBaseSplitCodeFactoryContractSubactionMsg>> {
    const [deployBaseSplitCodeFactoryContractTxHash] = txHashes
    const { contractAddress: baseSplitCodeFactoryContract } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployBaseSplitCodeFactoryContractTxHash,
    })
    if (!baseSplitCodeFactoryContract) {
      throw new ContractNotFoundError(deployBaseSplitCodeFactoryContractTxHash, 'baseSplitCodeFactoryContract')
    }
    registry['baseSplitCodeFactoryContract'] = baseSplitCodeFactoryContract

    const newMessage = {
      baseSplitCodeFactoryContract: baseSplitCodeFactoryContract,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
