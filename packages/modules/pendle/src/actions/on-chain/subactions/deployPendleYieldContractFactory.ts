import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployPendleYieldContractFactoryTxBuilder,
  DeployPendleYieldContractFactoryTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleYieldContractFactory/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployPendleYieldContractFactorySubactionParams = DeployPendleYieldContractFactoryTxBuilderParams

export type DeployPendleYieldContractFactorySubactionMsg = {
  pendleYieldContractFactory: Address
}

export class DeployPendleYieldContractFactorySubaction extends SubAction<
  DeployPendleYieldContractFactorySubactionParams,
  PendleRegistry,
  DeployPendleYieldContractFactorySubactionMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleYieldContractFactoryTxBuilderParams) {
    super(DeployPendleYieldContractFactorySubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployPendleYieldContractFactoryTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendleYieldContractFactorySubactionMsg>> {
    const [deployPendleYieldContractFactoryTxHash] = txHashes
    const { contractAddress: pendleYieldContractFactory } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleYieldContractFactoryTxHash,
    })
    if (!pendleYieldContractFactory) {
      throw new ContractNotFoundError(deployPendleYieldContractFactoryTxHash, 'PendleYieldContractFactory')
    }
    registry.pendleYieldContractFactory = pendleYieldContractFactory

    const newMessage = {
      pendleYieldContractFactory: pendleYieldContractFactory,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
