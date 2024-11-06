import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployTransparentUpgradeableProxyTxBuilder } from '@actions/subactions/tx-builders/TransparentUpgradeableProxy/deploy'

import { InitCapitalRegistry } from '@/src/type'

export type DeployPythOracleReaderProxySubActionParams = {
  proxyAdmin: Address
  pythOracleReaderImpl: Address
}

export type DeployPythOracleReaderProxyMsg = {
  pythOracleReaderProxy: Address
}

export class DeployPythOracleReaderProxySubAction extends SubAction<
  DeployPythOracleReaderProxySubActionParams,
  InitCapitalRegistry,
  DeployPythOracleReaderProxyMsg
> {
  constructor(client: InfinitWallet, params: DeployPythOracleReaderProxySubActionParams) {
    super(DeployPythOracleReaderProxySubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- deploy proxy point to implementation -----------
    this.txBuilders.push(
      new DeployTransparentUpgradeableProxyTxBuilder(this.client, {
        logic: this.params.pythOracleReaderImpl,
        admin: this.params.proxyAdmin,
        data: '0x',
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry, DeployPythOracleReaderProxyMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [deployPythOracleReaderProxyHash] = txHashes

    // get the deployed address from the txHash
    const { contractAddress: pythOracleReaderProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPythOracleReaderProxyHash,
    })

    // check if the contract address is not found
    if (!pythOracleReaderProxy) {
      throw new ContractNotFoundError(deployPythOracleReaderProxyHash, 'PythOracleReaderProxy')
    }

    // assign the contract address to the registry
    registry['pythOracleReaderProxy'] = pythOracleReaderProxy

    const newMessage: DeployPythOracleReaderProxyMsg = {
      pythOracleReaderProxy,
    }

    // return the new registry and new message
    return { newRegistry: registry, newMessage: newMessage }
  }
}
