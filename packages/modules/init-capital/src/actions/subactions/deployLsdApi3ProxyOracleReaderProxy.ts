import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployTransparentUpgradeableProxyTxBuilder } from '@actions/subactions/tx-builders/TransparentUpgradeableProxy/deploy'

import { InitCapitalRegistry } from '@/src/type'

export type DeployLsdApi3ProxyOracleReaderProxyMsg = {
  lsdApi3ProxyOracleReaderProxy: Address
}

export type DeployLsdApi3ProxyOracleProxySubActionParams = {
  proxyAdmin: Address
  lsdApi3ProxyOracleReaderImpl: Address
}

export class DeployLsdApi3ProxyOracleProxySubAction extends SubAction<
  DeployLsdApi3ProxyOracleProxySubActionParams,
  InitCapitalRegistry,
  object
> {
  constructor(client: InfinitWallet, params: DeployLsdApi3ProxyOracleProxySubActionParams) {
    super(DeployLsdApi3ProxyOracleProxySubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- deploy proxy point to implementation -----------
    this.txBuilders.push(
      new DeployTransparentUpgradeableProxyTxBuilder(this.client, {
        logic: this.params.lsdApi3ProxyOracleReaderImpl,
        admin: this.params.proxyAdmin,
        data: '0x',
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry, DeployLsdApi3ProxyOracleReaderProxyMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [deployLsdApi3ProxyOracleReaderProxyHash] = txHashes

    // get the deployed address from the txHash
    const { contractAddress: lsdApi3ProxyOracleReaderProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployLsdApi3ProxyOracleReaderProxyHash,
    })

    // check if the contract address is not found
    if (!lsdApi3ProxyOracleReaderProxy) {
      throw new ContractNotFoundError(deployLsdApi3ProxyOracleReaderProxyHash, 'LsdApi3ProxyOracleReaderProxy')
    }

    // assign the contract address to the registry
    registry['lsdApi3ProxyOracleReaderProxy'] = lsdApi3ProxyOracleReaderProxy
    const newMessage: DeployLsdApi3ProxyOracleReaderProxyMsg = {
      lsdApi3ProxyOracleReaderProxy: lsdApi3ProxyOracleReaderProxy,
    }

    // return the new registry and new message
    return { newRegistry: registry, newMessage: newMessage }
  }
}
