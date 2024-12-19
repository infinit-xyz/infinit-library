import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployPendleYieldContractFactoryTxBuilder,
  DeployPendleYieldContractFactoryTxBuilderParams,
} from '@actions/subactions/tx-builders/PendleYieldContractFactory/deploy'

import { PendleV3Registry } from '@/src/type'

export type DeployPendleYieldContractFactorySubactionParams = DeployPendleYieldContractFactoryTxBuilderParams

export type DeployPendleYieldContractFactorySubactionMsg = {
  pendleYieldContractFactory: Address
}

export class DeployPendleYieldContractFactorySubaction extends SubAction<
  DeployPendleYieldContractFactorySubactionParams,
  PendleV3Registry,
  DeployPendleYieldContractFactorySubactionMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleYieldContractFactoryTxBuilderParams) {
    super(DeployPendleYieldContractFactorySubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployPendleYieldContractFactoryTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployPendleYieldContractFactorySubactionMsg>> {
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
