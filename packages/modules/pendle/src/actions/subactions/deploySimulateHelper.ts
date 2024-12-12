import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeploySimulateHelperTxBuilder } from '@actions/subactions/tx-builders/SimulateHelper/deploy'

import { PendleRegistry } from '@/src/type'

export type DeploySimulateHelperMsg = {
  simulateHelper: Address
}

export class DeploySimulateHelperSubAction extends SubAction<{}, PendleRegistry, DeploySimulateHelperMsg> {
  constructor(client: InfinitWallet, params: {}) {
    super(DeploySimulateHelperSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- deploy simulate helper -----------
    this.txBuilders.push(new DeploySimulateHelperTxBuilder(this.client, {}))
  }

  public async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeploySimulateHelperMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [deploySimulateHelperHash] = txHashes

    // registers multicall2
    const { contractAddress: simulateHelper } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deploySimulateHelperHash,
    })

    // check if the contract address is not found
    if (!simulateHelper) {
      throw new ContractNotFoundError(deploySimulateHelperHash, 'SimulateHelper')
    }

    // assign the contract address to the registry
    registry['simulateHelper'] = simulateHelper

    // construct the new message
    const newMessage: DeploySimulateHelperMsg = {
      simulateHelper,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
