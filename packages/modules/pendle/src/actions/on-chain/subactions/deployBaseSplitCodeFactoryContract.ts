import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import { DeployBaseSplitCodeFactoryContractTxBuilder } from './txBuilders/BaseSplitCodeFactoryContract/deploy'
import { PendleV3Registry } from '@/src/type'

export type DeployBaseSplitCodeFactoryContractSubactionMsg = {
  baseSplitCodeFactoryContract: Address
}
export class DeployBaseSplitCodeFactoryContractSubaction extends SubAction<
  object,
  PendleV3Registry,
  DeployBaseSplitCodeFactoryContractSubactionMsg
> {
  constructor(client: InfinitWallet) {
    super(DeployBaseSplitCodeFactoryContractSubaction.name, client, {})
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployBaseSplitCodeFactoryContractTxBuilder(this.client)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployBaseSplitCodeFactoryContractSubactionMsg>> {
    const [deployBaseSplitCodeFactoryContractTxHash] = txHashes
    const { contractAddress: baseSplitCodeFactoryContract } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployBaseSplitCodeFactoryContractTxHash,
    })
    if (!baseSplitCodeFactoryContract) {
      throw new ContractNotFoundError(deployBaseSplitCodeFactoryContractTxHash, 'baseSplitCodeFactoryContract')
    }
    registry.baseSplitCodeFactoryContract = baseSplitCodeFactoryContract

    const newMessage = {
      baseSplitCodeFactoryContract: baseSplitCodeFactoryContract,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
