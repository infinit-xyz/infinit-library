import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployTransparentUpgradeableProxyTxBuilder } from '@actions/subactions/tx-builders/TransparentUpgradeableProxy/deploy'

import { InitCapitalRegistry } from '@/src/type'

export type DeployApi3ProxyOracleProxySubActionParams = {
  proxyAdmin: Address
  api3ProxyOracleReaderImpl: Address
}

export class DeployApi3ProxyOracleProxySubAction extends SubAction<DeployApi3ProxyOracleProxySubActionParams, InitCapitalRegistry> {
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

    const [deployInitCoreProxyHash] = txHashes

    const { contractAddress: api3ProxyOracleReaderProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployInitCoreProxyHash,
    })

    // get contract address
    if (!api3ProxyOracleReaderProxy) {
      throw new ContractNotFoundError(deployInitCoreProxyHash, 'InitCore')
    }

    registry['api3ProxyOracleReaderProxy'] = api3ProxyOracleReaderProxy

    return { newRegistry: registry, newMessage: {} }
  }
}
