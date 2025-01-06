import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import { DeployPendleSwapTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleSwap/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployPendleSwapSubactionMsg = {
  pendleSwap: Address
}

export class DeployPendleSwapSubaction extends SubAction<object, PendleRegistry, DeployPendleSwapSubactionMsg> {
  constructor(client: InfinitWallet) {
    super(DeployPendleSwapSubaction.name, client, {})
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployPendleSwapTxBuilder(this.client)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendleSwapSubactionMsg>> {
    const [deployPendleSwapTxHash] = txHashes
    const { contractAddress: pendleSwap } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleSwapTxHash,
    })
    if (!pendleSwap) {
      throw new ContractNotFoundError(deployPendleSwapTxHash, 'PendleSwap')
    }
    registry['pendleSwap'] = pendleSwap

    const newMessage = {
      pendleSwap: pendleSwap,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
