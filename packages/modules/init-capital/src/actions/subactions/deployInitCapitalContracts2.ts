import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { InitCapitalRegistry } from '@/src/type'
import { DeployConfigTxBuilder } from '@actions/subactions/tx-builders/Config/deploy'
import { DeployInitOracleTxBuilder } from '@actions/subactions/tx-builders/InitOracle/deploy'
import { DeployLiqIncentiveCalculatorTxBuilder } from '@actions/subactions/tx-builders/LiqIncentiveCalculator/deploy'
import { DeployPosManagerTxBuilder } from '@actions/subactions/tx-builders/PosManager/deploy'

export type DeployInitCapitalContracts_2SubActionParams = {
  accessControlManager: Address
}

export type DeployInitCapitalMsg_2 = {
  initOracleImpl: Address
  configImpl: Address
  liqIncentiveCalculatorImpl: Address
  posManagerImpl: Address
}

export class DeployInitCapitalContracts2SubAction extends SubAction<DeployInitCapitalContracts_2SubActionParams, InitCapitalRegistry, DeployInitCapitalMsg_2> {
  constructor(client: InfinitWallet, params: DeployInitCapitalContracts_2SubActionParams) {
    super(DeployInitCapitalContracts2SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilderParams = {
      accessControlManager: this.params.accessControlManager
    }
    // ----------- implementation -----------
    this.txBuilders.push(new DeployInitOracleTxBuilder(this.client, txBuilderParams))
    this.txBuilders.push(new DeployConfigTxBuilder(this.client, txBuilderParams))
    this.txBuilders.push(new DeployLiqIncentiveCalculatorTxBuilder(this.client, txBuilderParams))
    this.txBuilders.push(new DeployPosManagerTxBuilder(this.client, txBuilderParams))
  }

  public async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry, DeployInitCapitalMsg_2>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [
      deployInitOracleImplHash, 
      deployConfigImplHash, 
      deployLiqIncentiveCalculatorImplHash, 
      deployPosManagerImplHash 
    ] = txHashes

    const { contractAddress: initOracleImpl } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployInitOracleImplHash,
    })
    if (!initOracleImpl) {
      throw new ContractNotFoundError(deployInitOracleImplHash, 'InitOracle')
    }
    registry['initOracleImpl'] = initOracleImpl

    const { contractAddress: configImpl } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployConfigImplHash,
    })
    if (!configImpl) {
      throw new ContractNotFoundError(deployConfigImplHash, 'Config')
    }
    registry['configImpl'] = configImpl

    const { contractAddress: liqIncentiveCalculatorImpl } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployLiqIncentiveCalculatorImplHash,
    })
    if (!liqIncentiveCalculatorImpl) {
      throw new ContractNotFoundError(deployLiqIncentiveCalculatorImplHash, 'LiqIncentiveCalculator')
    }
    registry['liqIncentiveCalculatorImpl'] = liqIncentiveCalculatorImpl

    const { contractAddress: posManagerImpl } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPosManagerImplHash,
    })
    if (!posManagerImpl) {
      throw new ContractNotFoundError(deployPosManagerImplHash, 'PosManager')
    }
    registry['posManagerImpl'] = posManagerImpl

    const newMessage: DeployInitCapitalMsg_2 = {
      initOracleImpl,
      configImpl,
      liqIncentiveCalculatorImpl,
      posManagerImpl
    }

    return { newRegistry: registry, newMessage: newMessage }
  }
}
