import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployPendleMarketFactoryV3TxBuilder,
  DeployPendleMarketFactoryV3TxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleMarketFactoryV3/deploy'

import { PendleV3Registry } from '@/src/type'

export type DeployPendleMarketFactoryV3SubactionParams = DeployPendleMarketFactoryV3TxBuilderParams

export type DeployPendleMarketFactoryV3SubactionMsg = {
  pendleMarketFactoryV3: Address
}
export class DeployPendleMarketFactoryV3Subaction extends SubAction<
  DeployPendleMarketFactoryV3SubactionParams,
  PendleV3Registry,
  DeployPendleMarketFactoryV3SubactionMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleMarketFactoryV3TxBuilderParams) {
    super(DeployPendleMarketFactoryV3Subaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployPendleMarketFactoryV3TxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployPendleMarketFactoryV3SubactionMsg>> {
    const [deployPendleMarketFactoryV3TxHash] = txHashes
    const { contractAddress: pendleMarketFactoryV3 } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleMarketFactoryV3TxHash,
    })
    if (!pendleMarketFactoryV3) {
      throw new ContractNotFoundError(deployPendleMarketFactoryV3TxHash, 'PendleMarketFactoryV3')
    }
    registry.pendleMarketFactoryV3 = pendleMarketFactoryV3

    const newMessage = {
      pendleMarketFactoryV3: pendleMarketFactoryV3,
    }

    return { 
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
