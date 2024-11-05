import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployTransparentUpgradeableProxyTxBuilder } from '@actions/subactions/tx-builders/TransparentUpgradeableProxy/deploy'

import { InitCapitalRegistry } from '@/src/type'

export type DeployApi3ProxyOracleProxySubActionParams = {
  proxyAdmin: Address
  api3ProxyOracleReaderImpl: Address
}

export class DeployApi3ProxyOracleProxySubAction extends SubAction<DeployApi3ProxyOracleProxySubActionParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: DeployApi3ProxyOracleProxySubActionParams) {
    super(DeployApi3ProxyOracleProxySubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- deploy proxy point to implementation -----------
    this.txBuilders.push(
      new DeployTransparentUpgradeableProxyTxBuilder(this.client, {
        logic: this.params.api3ProxyOracleReaderImpl,
        admin: this.params.proxyAdmin,
        data: '0x',
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [deployApi3ProxyOracleReaderProxyHash] = txHashes

    // get the deployed address from the txHash
    const { contractAddress: api3ProxyOracleReaderProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployApi3ProxyOracleReaderProxyHash,
    })

    // check if the contract address is not found
    if (!api3ProxyOracleReaderProxy) {
      throw new ContractNotFoundError(deployApi3ProxyOracleReaderProxyHash, 'Api3ProxyOracleReaderProxy')
    }

    // assign the contract address to the registry
    registry['api3ProxyOracleReaderProxy'] = api3ProxyOracleReaderProxy

    // return the new registry and new message
    return { newRegistry: registry, newMessage: {} }
  }
}
