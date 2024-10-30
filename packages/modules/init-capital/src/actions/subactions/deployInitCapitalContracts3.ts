import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployTransparentUpgradeableProxyTxBuilder } from '@actions/subactions/tx-builders/TransparentUpgradeableProxy/deploy'

import { InitCapitalRegistry } from '@/src/type'

export type DeployInitCapitalContracts_3SubActionParams = {
  proxyAdmin: Address
  initOracleImpl: Address
  configImpl: Address
  liqIncentiveCalculatorImpl: Address
  posManagerImpl: Address
}

export type DeployInitCapitalMsg_3 = {
  initOracleProxy: Address
  configProxy: Address
  liqIncentiveCalculatorProxy: Address
  posManagerProxy: Address
}

export class DeployInitCapitalContracts3SubAction extends SubAction<
  DeployInitCapitalContracts_3SubActionParams,
  InitCapitalRegistry,
  DeployInitCapitalMsg_3
> {
  constructor(client: InfinitWallet, params: DeployInitCapitalContracts_3SubActionParams) {
    super(DeployInitCapitalContracts3SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- proxy -----------
    // deployInitOracleProxy
    this.txBuilders.push(
      new DeployTransparentUpgradeableProxyTxBuilder(this.client, {
        admin: this.params.proxyAdmin,
        logic: this.params.initOracleImpl,
        data: '0x',
      }),
    )
    // deployConfigProxy
    this.txBuilders.push(
      new DeployTransparentUpgradeableProxyTxBuilder(this.client, {
        admin: this.params.proxyAdmin,
        logic: this.params.configImpl,
        data: '0x',
      }),
    )
    // deployLiqIncentiveCalculatorProxy
    this.txBuilders.push(
      new DeployTransparentUpgradeableProxyTxBuilder(this.client, {
        admin: this.params.proxyAdmin,
        logic: this.params.liqIncentiveCalculatorImpl,
        data: '0x',
      }),
    )
    // deployPosManagerProxy
    this.txBuilders.push(
      new DeployTransparentUpgradeableProxyTxBuilder(this.client, {
        admin: this.params.proxyAdmin,
        logic: this.params.posManagerImpl,
        data: '0x',
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry, DeployInitCapitalMsg_3>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployInitOracleProxyHash, deployConfigProxyHash, deployLiqIncentiveCalculatorProxyHash, deployPosManagerProxyHash] = txHashes

    const { contractAddress: initOracleProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployInitOracleProxyHash,
    })
    if (!initOracleProxy) {
      throw new ContractNotFoundError(deployInitOracleProxyHash, 'InitOracleProxy')
    }
    registry['initOracleProxy'] = initOracleProxy

    const { contractAddress: configProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployConfigProxyHash,
    })
    if (!configProxy) {
      throw new ContractNotFoundError(deployConfigProxyHash, 'ConfigProxy')
    }
    registry['configProxy'] = configProxy

    const { contractAddress: liqIncentiveCalculatorProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployLiqIncentiveCalculatorProxyHash,
    })
    if (!liqIncentiveCalculatorProxy) {
      throw new ContractNotFoundError(deployLiqIncentiveCalculatorProxyHash, 'LiqIncentiveCalculatorProxy')
    }
    registry['liqIncentiveCalculatorProxy'] = liqIncentiveCalculatorProxy

    const { contractAddress: posManagerProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPosManagerProxyHash,
    })
    if (!posManagerProxy) {
      throw new ContractNotFoundError(deployPosManagerProxyHash, 'PosManagerProxy')
    }
    registry['posManagerProxy'] = posManagerProxy

    const newMessage: DeployInitCapitalMsg_3 = {
      initOracleProxy,
      configProxy,
      liqIncentiveCalculatorProxy,
      posManagerProxy,
    }

    return { newRegistry: registry, newMessage: newMessage }
  }
}
