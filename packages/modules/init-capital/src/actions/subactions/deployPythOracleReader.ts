import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployPythOracleReaderTxBuilder,
  DeployPythOracleReaderTxBuilderParams,
} from '@actions/subactions/tx-builders/PythOracleReader/deploy'

import { InitCapitalRegistry } from '@/src/type'

export type DeployPythOracleReaderSubActionParams = DeployPythOracleReaderTxBuilderParams

export type DeployPythOracleReaderMsg = {
  pythOracleReaderImpl: Address
}

export class DeployPythOracleReaderSubAction extends SubAction<DeployPythOracleReaderSubActionParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: DeployPythOracleReaderSubActionParams) {
    super(DeployPythOracleReaderSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilder = new DeployPythOracleReaderTxBuilder(this.client, this.params)
    this.txBuilders.push(txBuilder)
  }

  protected async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry, DeployPythOracleReaderMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [pythOracleReaderImplHash] = txHashes

    // get the deployed address from the txHash
    const { contractAddress: pythOracleReaderImpl } = await this.client.publicClient.waitForTransactionReceipt({
      hash: pythOracleReaderImplHash,
    })

    // check if the contract address is not found
    if (!pythOracleReaderImpl) {
      throw new ContractNotFoundError(pythOracleReaderImplHash, 'PythOracleReader')
    }

    // assign the contract address to the registry
    registry['pythOracleReaderImpl'] = pythOracleReaderImpl

    const newMessage: DeployPythOracleReaderMsg = {
      pythOracleReaderImpl,
    }

    // return the new registry and new message
    return { newRegistry: registry, newMessage: newMessage }
  }
}
