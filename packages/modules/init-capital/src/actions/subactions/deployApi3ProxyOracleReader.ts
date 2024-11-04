import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployApi3ProxyOracleReaderTxBuilder,
  DeployApi3ProxyOracleReaderTxBuilderParams,
} from '@actions/subactions/tx-builders/Api3ProxyOracleReader/deploy'

import { InitCapitalRegistry } from '@/src/type'

export type DeployApi3ProxyOracleReaderSubActionParams = DeployApi3ProxyOracleReaderTxBuilderParams

export type DeployApi3ProxyOracleReaderMsg = {
  api3ProxyOracleReaderImpl: Address
}

export class DeployApi3ProxyOracleReaderSubAction extends SubAction<
  DeployApi3ProxyOracleReaderSubActionParams,
  InitCapitalRegistry,
  DeployApi3ProxyOracleReaderMsg
> {
  constructor(client: InfinitWallet, params: DeployApi3ProxyOracleReaderSubActionParams) {
    super(DeployApi3ProxyOracleReaderSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilder = new DeployApi3ProxyOracleReaderTxBuilder(this.client, this.params)
    this.txBuilders.push(txBuilder)
  }

  protected async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry, DeployApi3ProxyOracleReaderMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [api3ProxyOracleReaderImplHash] = txHashes

    // get the deployed address from the txHash
    const { contractAddress: api3ProxyOracleReaderImpl } = await this.client.publicClient.waitForTransactionReceipt({
      hash: api3ProxyOracleReaderImplHash,
    })

    // check if the contract address is not found
    if (!api3ProxyOracleReaderImpl) {
      throw new ContractNotFoundError(api3ProxyOracleReaderImplHash, 'Api3ProxyOracleReader')
    }

    // assign the contract address to the registry
    registry['api3ProxyOracleReaderImpl'] = api3ProxyOracleReaderImpl

    const newMessage: DeployApi3ProxyOracleReaderMsg = {
      api3ProxyOracleReaderImpl,
    }

    // return the new registry and new message
    return { newRegistry: registry, newMessage: newMessage }
  }
}
