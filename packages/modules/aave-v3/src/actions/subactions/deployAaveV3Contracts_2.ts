import _ from 'lodash'

import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import { DefaultReserveInterestRateStrategyConfig } from '@actions/subactions/deployDefaultReserveInterestRateStrategy'
import { DeployAaveOracleTxBuilder } from '@actions/subactions/tx-builders/aaveOracle/deployAaveOracle'
import { DeployAaveProtocolDataProvider } from '@actions/subactions/tx-builders/aaveProtocolDataProvider/deployAaveProtocolDataProvider'
import { DeployACLManagerTxBuilder } from '@actions/subactions/tx-builders/aclManager/deployACLManager'
import { DeployDefaultReserveInterestRateStrategyTxBuilder } from '@actions/subactions/tx-builders/defaultReserveInterestRateStrategy/deployDefaultReserveInterestRateStrategy'
import { DeployFlashLoanLogicTxBuilder } from '@actions/subactions/tx-builders/deploy/deployFlashloanLogic'
import { SetACLAdminTxBuilder } from '@actions/subactions/tx-builders/poolAddressesProvider/setACLAdmin'
import { DeployPoolConfiguratorTxBuilder } from '@actions/subactions/tx-builders/poolConfigurator/deployPoolConfigurator'

import { AaveV3Registry } from '@/src/type'

export type DeployAaveV3Contracts_2SubActionParams = {
  // roles
  aclAdmin: Address
  poolAddressesProvider: Address
  borrowLogic: Address
  configuratorLogic: Address

  // oracle
  assets: Address[]
  sources: Address[]
  fallbackOracle: Address
  baseCurrency: Address
  baseCurrencyUnit: bigint

  // DefaultReserveInterestRateStrategy
  defaultReserveInterestRateStrategyConfigs: DefaultReserveInterestRateStrategyConfig[]
}

export type DeployAaveV3Contracts_2SubActionMsg = {
  aaveProtocolDataProvider: Address
  flashLoanLogic: Address
  poolConfiguratorImpl: Address
  aclManager: Address
  aaveOracle: Address
}

export class DeployAaveV3Contracts_2SubAction extends SubAction<
  DeployAaveV3Contracts_2SubActionParams,
  AaveV3Registry,
  DeployAaveV3Contracts_2SubActionMsg
> {
  constructor(client: InfinitWallet, params: DeployAaveV3Contracts_2SubActionParams) {
    super(DeployAaveV3Contracts_2SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // set acl admin
    const setACLAdminSubAction = new SetACLAdminTxBuilder(this.client, {
      poolAddressesProvider: this.params.poolAddressesProvider,
      aclAdmin: this.client.walletClient.account.address,
    })
    this.txBuilders.push(setACLAdminSubAction)

    // deploy aave protocol data provider
    const deployAaveProtocolDataProviderSubAction = new DeployAaveProtocolDataProvider(this.client, {
      poolAddressesProvider: this.params.poolAddressesProvider,
    })
    this.txBuilders.push(deployAaveProtocolDataProviderSubAction)

    // flashloan logic
    const deployFlashLoanLogicSubAction = new DeployFlashLoanLogicTxBuilder(this.client, { borrowLogic: this.params.borrowLogic })
    this.txBuilders.push(deployFlashLoanLogicSubAction)

    //2.2 deploy pool configurator
    const deployPoolConfiguratorSubAction = new DeployPoolConfiguratorTxBuilder(this.client, {
      configuratorLogic: this.params.configuratorLogic,
    })
    this.txBuilders.push(deployPoolConfiguratorSubAction)

    // 2.3 deploy ACLManager
    const deployACLManagerSubAction = new DeployACLManagerTxBuilder(this.client, { poolAddressProvider: this.params.poolAddressesProvider })
    this.txBuilders.push(deployACLManagerSubAction)

    // 2.4 deploy oracle
    const deployOracleSubAction = new DeployAaveOracleTxBuilder(this.client, {
      poolAddressProvider: this.params.poolAddressesProvider,
      assets: this.params.assets,
      sources: this.params.sources,
      fallbackOracle: this.params.fallbackOracle,
      baseCurrency: this.params.baseCurrency,
      baseCurrencyUnit: this.params.baseCurrencyUnit,
    })
    this.txBuilders.push(deployOracleSubAction)

    // deploy reserve interest rate strategy
    for (const defaultReserveInterestRateStrategyConfig of this.params.defaultReserveInterestRateStrategyConfigs) {
      const txBuilder = new DeployDefaultReserveInterestRateStrategyTxBuilder(this.client, defaultReserveInterestRateStrategyConfig.params)
      this.txBuilders.push(txBuilder)
    }
  }

  public async updateRegistryAndMessage(
    registry: AaveV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<AaveV3Registry, DeployAaveV3Contracts_2SubActionMsg>> {
    const [
      _setACLAdminSubActionHash,
      deployAaveProtocolDataProviderHash,
      deployFlashLoanLogicHash,
      deployPoolConfiguratorHash,
      deployACLManagerHash,
      deployOracleHash,
      ...deployDefaultReserveIRSHashes
    ] = txHashes
    if (deployDefaultReserveIRSHashes.length != this.params.defaultReserveInterestRateStrategyConfigs.length) {
      throw new ValidateInputValueError('deployDefaultReserveIRSHashes&params length mismatched')
    }
    const { contractAddress: aaveProtocolDataProvider } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployAaveProtocolDataProviderHash,
    })
    if (!aaveProtocolDataProvider) {
      throw new ContractNotFoundError(deployAaveProtocolDataProviderHash, 'aaveProtocolDataProvider')
    }
    registry['aaveProtocolDataProvider'] = aaveProtocolDataProvider

    const { contractAddress: flashLoanLogic } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployFlashLoanLogicHash })
    if (!flashLoanLogic) {
      throw new ContractNotFoundError(deployFlashLoanLogicHash, 'flashLoanLogic')
    }
    registry['flashLoanLogic'] = flashLoanLogic

    const { contractAddress: poolConfiguratorImpl } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPoolConfiguratorHash,
    })
    if (!poolConfiguratorImpl) {
      throw new ContractNotFoundError(deployPoolConfiguratorHash, 'poolConfiguratorImpl')
    }
    registry['poolConfiguratorImpl'] = poolConfiguratorImpl

    const { contractAddress: aclManager } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployACLManagerHash })
    if (!aclManager) {
      throw new ContractNotFoundError(deployACLManagerHash, 'aclManager')
    }
    registry['aclManager'] = aclManager

    const { contractAddress: aaveOracle } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployOracleHash })
    if (!aaveOracle) {
      throw new ContractNotFoundError(deployOracleHash, 'aaveOracle')
    }
    registry['aaveOracle'] = aaveOracle

    for (let i = 0; i < deployDefaultReserveIRSHashes.length; i++) {
      const { contractAddress: defaultReserveInterestRateStrategy } = await this.client.publicClient.waitForTransactionReceipt({
        hash: deployDefaultReserveIRSHashes[i],
      })
      if (!defaultReserveInterestRateStrategy) {
        throw new ContractNotFoundError(deployDefaultReserveIRSHashes[i], 'reserveInterestRateStrategies')
      }

      _.set(
        registry,
        ['reserveInterestRateStrategies', this.params.defaultReserveInterestRateStrategyConfigs[i].name],
        defaultReserveInterestRateStrategy,
      )
    }

    const newMessage: DeployAaveV3Contracts_2SubActionMsg = {
      aaveProtocolDataProvider: aaveProtocolDataProvider,
      flashLoanLogic: flashLoanLogic,
      poolConfiguratorImpl: poolConfiguratorImpl,
      aclManager: aclManager,
      aaveOracle: aaveOracle,
    }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
