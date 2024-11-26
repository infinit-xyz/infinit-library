import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployLsdApi3ProxyOracleReaderTxBuilder,
  DeployLsdApi3ProxyOracleReaderTxBuilderParams,
} from '@actions/subactions/tx-builders/LsdApi3ProxyOracleReader/deploy'

import { InitCapitalRegistry } from '@/src/type'

export type DeployLsdApi3ProxyOracleReaderSubActionParams = DeployLsdApi3ProxyOracleReaderTxBuilderParams

export type DeployLsdApi3ProxyOracleReaderMsg = {
  lsdApi3ProxyOracleReaderImpl: Address
}

export class DeployLsdApi3ProxyOracleReaderSubAction extends SubAction<
  DeployLsdApi3ProxyOracleReaderSubActionParams,
  InitCapitalRegistry,
  DeployLsdApi3ProxyOracleReaderMsg
> {
  constructor(client: InfinitWallet, params: DeployLsdApi3ProxyOracleReaderSubActionParams) {
    super(DeployLsdApi3ProxyOracleReaderSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilder = new DeployLsdApi3ProxyOracleReaderTxBuilder(this.client, this.params)
    this.txBuilders.push(txBuilder)
  }

  protected async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry, DeployLsdApi3ProxyOracleReaderMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [lsdApi3ProxyOracleReaderImplHash] = txHashes

    // get the deployed address from the txHash
    const { contractAddress: lsdApi3ProxyOracleReaderImpl } = await this.client.publicClient.waitForTransactionReceipt({
      hash: lsdApi3ProxyOracleReaderImplHash,
    })

    // check if the contract address is not found
    if (!lsdApi3ProxyOracleReaderImpl) {
      throw new ContractNotFoundError(lsdApi3ProxyOracleReaderImplHash, 'LsdApi3ProxyOracleReader')
    }

    // assign the contract address to the registry
    registry['lsdApi3ProxyOracleReaderImpl'] = lsdApi3ProxyOracleReaderImpl

    const newMessage: DeployLsdApi3ProxyOracleReaderMsg = {
      lsdApi3ProxyOracleReaderImpl,
    }

    // return the new registry and new message
    return { newRegistry: registry, newMessage: newMessage }
  }
}
