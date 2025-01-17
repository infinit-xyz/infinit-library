import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeploySupplyCapReaderTxBuilder } from '@actions/on-chain/subactions/txBuilders/SupplyCapReader/deploy'

import { PendleRegistry } from '@/src/type'

export type DeploySupplyCapReaderSubActionParams = {}

export type DeploySupplyCapReaderMsg = {
  supplyCapReader: Address
}

export class DeploySupplyCapReaderSubAction extends SubAction<
  DeploySupplyCapReaderSubActionParams,
  PendleRegistry,
  DeploySupplyCapReaderMsg
> {
  constructor(client: InfinitWallet, params: DeploySupplyCapReaderSubActionParams) {
    super(DeploySupplyCapReaderSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- deploy simulate helper -----------
    this.txBuilders.push(new DeploySupplyCapReaderTxBuilder(this.client))
  }

  public async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeploySupplyCapReaderMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [deploySupplyCapReaderHash] = txHashes

    // get the deployed address from the txHash
    const { contractAddress: supplyCapReader } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deploySupplyCapReaderHash,
    })

    // check if the contract address is not found
    if (!supplyCapReader) {
      throw new ContractNotFoundError(deploySupplyCapReaderHash, 'SupplyCapReader')
    }

    // assign the contract address to the registry
    registry['supplyCapReader'] = supplyCapReader

    // construct the new message
    const newMessage: DeploySupplyCapReaderMsg = {
      supplyCapReader,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
