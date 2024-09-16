import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployInitializableAdminUpgradeabilityProxyTxBuilder } from '@actions/subactions/tx-builders/InitializableAdminUpgradeabilityProxy/deployProxy'
import { DeployAaveEcosystemReserveControllerTxBuilder } from '@actions/subactions/tx-builders/aaveEcosystemReserveController/deployAaveEcosystemReserveController'
import { DeployAaveEcosystemReserveV2TxBuilder } from '@actions/subactions/tx-builders/aaveEcosystemReserveV2/deployAaveEcosystemReserveV2'
import { DeployBorrowLogicTxBuilder } from '@actions/subactions/tx-builders/deploy/deployBorrowLogic'
import { DeployBridgeLogicTxBuilder } from '@actions/subactions/tx-builders/deploy/deployBridgeLogic'
import { DeployConfiguratorLogicTxBuilder } from '@actions/subactions/tx-builders/deploy/deployConfiguratorLogic'
import { DeployEModeLogicTxBuilder } from '@actions/subactions/tx-builders/deploy/deployEmodeLogic'
import { DeployLiquidationLogicTxBuilder } from '@actions/subactions/tx-builders/deploy/deployLiquidationLogic'
import { DeployPoolLogicTxBuilder } from '@actions/subactions/tx-builders/deploy/deployPoolLogic'
import { DeploySupplyLogicTxBuilder } from '@actions/subactions/tx-builders/deploy/deploySupplyLogic'
import { DeployPoolAddressProviderTxBuilder } from '@actions/subactions/tx-builders/poolAddressesProvider/deployPoolAddressesProvider'
import { DeployPoolAddressesProviderRegistryTxBuilder } from '@actions/subactions/tx-builders/poolAddressesProviderRegistry/deployPoolAddressesProviderRegistry'
import { DeployReservesSetupHelperTxBuilder } from '@actions/subactions/tx-builders/reservesSetupHelper/deployReservesSetupHelper'
import { DeployUiIncentiveDataProviderV3TxBuilder } from '@actions/subactions/tx-builders/uiIncentiveDataProviderV3/deployUiIncentiveDataProviderV3'
import { DeployUiPoolDataProviderV3TxBuilder } from '@actions/subactions/tx-builders/uiPoolDataProviderV3/deployUiPoolDataProviderV3'
import { DeployWalletBalanceProviderTxBuilder } from '@actions/subactions/tx-builders/walletBalanceProvider/deployWalletBalanceProvider'

import { AaveV3Registry } from '@/src/type'

export type DeployAaveV3Contracts_1SubActionParams = {
  treasuryOwner: Address
  marketId: string
  chainlinkAggProxy: Address
  chainlinkETHUSDAggProxy: Address
}
export type DeployAaveV3Contracts_1SubActionMsg = {
  poolAddressesProviderRegistry: Address
  poolAddressesProvider: Address
  liquidationLogic: Address
  supplyLogic: Address
  eModeLogic: Address
  borrowLogic: Address
  bridgeLogic: Address
  poolLogic: Address
  configuratorLogic: Address
  reservesSetupHelper: Address
  aaveEcosystemReserveController: Address
  aaveEcosystemReserveV2Impl: Address
  aaveEcosystemReserveV2Proxy: Address
  walletBalanceProvider: Address
  uiIncentiveDataProvider: Address
  uiPoolDataProviderV3: Address
}
export class DeployAaveV3Contracts_1SubAction extends SubAction<
  DeployAaveV3Contracts_1SubActionParams,
  AaveV3Registry,
  DeployAaveV3Contracts_1SubActionMsg
> {
  constructor(client: InfinitWallet, params: DeployAaveV3Contracts_1SubActionParams) {
    super(DeployAaveV3Contracts_1SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- 0 Core -----------
    // ----------- 0.0 Market Registry -----------

    // pool address provider registry
    const deployPoolAddressesProviderRegistrySubAction = new DeployPoolAddressesProviderRegistryTxBuilder(this.client, {
      owner: this.client.walletClient.account.address,
    })
    this.txBuilders.push(deployPoolAddressesProviderRegistrySubAction)

    // ----------- 0.1 Logic Libraries -----------
    // logic libs
    // supply logic
    const deploySupplyLogicSubAction = new DeploySupplyLogicTxBuilder(this.client)
    this.txBuilders.push(deploySupplyLogicSubAction)

    // borrow logic
    const deployBorrowLogicSubAction = new DeployBorrowLogicTxBuilder(this.client)
    this.txBuilders.push(deployBorrowLogicSubAction)

    // liquidation logic
    const deployLiquidationLogicSubAction = new DeployLiquidationLogicTxBuilder(this.client)
    this.txBuilders.push(deployLiquidationLogicSubAction)

    // e-mode logic
    const deployEmodeLogicSubAction = new DeployEModeLogicTxBuilder(this.client)
    this.txBuilders.push(deployEmodeLogicSubAction)

    // bridge logic
    const deployBridgeLogicSubAction = new DeployBridgeLogicTxBuilder(this.client)
    this.txBuilders.push(deployBridgeLogicSubAction)

    // configurator logic
    const deployConfiguratorLogicSubAction = new DeployConfiguratorLogicTxBuilder(this.client)
    this.txBuilders.push(deployConfiguratorLogicSubAction)

    // pool logic
    const deployPoolLogicSubAction = new DeployPoolLogicTxBuilder(this.client)
    this.txBuilders.push(deployPoolLogicSubAction)

    // -------- 1. periphery pre/1.1Treasury ---------
    // deploy treasury proxy
    const deployInitializableAdminUpgradeabilityProxySubAction = new DeployInitializableAdminUpgradeabilityProxyTxBuilder(this.client)
    this.txBuilders.push(deployInitializableAdminUpgradeabilityProxySubAction)

    // deploy aave ecosystem reserve controller
    const deployAaveEcosystemReserveControllerSubAction = new DeployAaveEcosystemReserveControllerTxBuilder(this.client, {
      treasuryOwner: this.params.treasuryOwner,
    })
    this.txBuilders.push(deployAaveEcosystemReserveControllerSubAction)

    // deploy aave ecosystem Reserve V2
    const deployAaveEcosystemReserveV2SubAction = new DeployAaveEcosystemReserveV2TxBuilder(this.client)
    this.txBuilders.push(deployAaveEcosystemReserveV2SubAction)

    // -------- 2. Market ---------
    // -------- 2.0 Setup AddressesProvider ---------
    // deploy pool address provider
    const deployPoolAddressProviderSubAction = new DeployPoolAddressProviderTxBuilder(this.client, {
      marketId: this.params.marketId,
      owner: this.client.walletClient.account.address,
    })
    this.txBuilders.push(deployPoolAddressProviderSubAction)

    // 2.1b

    // 2-2 pool configurator

    const deployReservesSetupHelperSubAction = new DeployReservesSetupHelperTxBuilder(this.client)
    this.txBuilders.push(deployReservesSetupHelperSubAction)

    // 3
    // 3.1 deploy wallet balance provider
    const deployWalletBalanceProviderSubAction = new DeployWalletBalanceProviderTxBuilder(this.client)
    this.txBuilders.push(deployWalletBalanceProviderSubAction)

    // 3.3 ui helper
    const deployUiIncentiveDataProviderV3SubAction = new DeployUiIncentiveDataProviderV3TxBuilder(this.client)
    this.txBuilders.push(deployUiIncentiveDataProviderV3SubAction)

    const deployUiPoolDataProviderV3 = new DeployUiPoolDataProviderV3TxBuilder(this.client, {
      networkBaseTokenPriceInUsdProxyAggregator: this.params.chainlinkAggProxy,
      marketReferenceCurrencyPriceInUsdProxyAggregator: this.params.chainlinkETHUSDAggProxy,
    })
    this.txBuilders.push(deployUiPoolDataProviderV3)
  }

  public async updateRegistryAndMessage(
    registry: AaveV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<AaveV3Registry, DeployAaveV3Contracts_1SubActionMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [
      deployPoolAddressesProviderRegistryHash,
      deploySupplyLogicHash,
      deployBorrowLogicHash,
      deployLiquidationLogicHash,
      deployEModeLogicHash,
      deployBridgeLogicHash,
      deployConfiguratorLogicHash,
      deployPoolLogicHash,
      deployInitializableAdminUpgradeabilityProxyHash,
      deployAaveEcosystemReserveControllerHash,
      deployAaveEcosystemReserveV2Hash,
      deployPoolAddressProviderHash,
      deployReservesSetupHelperHash,
      deployWalletBalanceProviderHash,
      deployUiIncentiveDataProviderV3Hash,
      deployUiPoolDataProviderV3Hash,
    ] = txHashes

    const { contractAddress: poolAddressesProviderRegistry } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPoolAddressesProviderRegistryHash,
    })
    if (!poolAddressesProviderRegistry) {
      throw new ContractNotFoundError(deployPoolAddressesProviderRegistryHash, 'poolAddressesProviderRegistry')
    }
    registry['poolAddressProviderRegistry'] = poolAddressesProviderRegistry

    const { contractAddress: supplyLogic } = await this.client.publicClient.waitForTransactionReceipt({ hash: deploySupplyLogicHash })
    if (!supplyLogic) {
      throw new ContractNotFoundError(deploySupplyLogicHash, 'supplyLogic')
    }
    registry['supplyLogic'] = supplyLogic

    const { contractAddress: borrowLogic } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployBorrowLogicHash })
    if (!borrowLogic) {
      throw new ContractNotFoundError(deployBorrowLogicHash, 'borrowLogic')
    }
    registry['borrowLogic'] = borrowLogic

    const { contractAddress: liquidationLogic } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployLiquidationLogicHash,
    })
    if (!liquidationLogic) {
      throw new ContractNotFoundError(deployLiquidationLogicHash, 'liquidationLogic')
    }
    registry['liquidationLogic'] = liquidationLogic

    const { contractAddress: eModeLogic } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployEModeLogicHash })
    if (!eModeLogic) {
      throw new ContractNotFoundError(deployEModeLogicHash, 'eModeLogic')
    }
    registry['eModeLogic'] = eModeLogic

    const { contractAddress: bridgeLogic } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployBridgeLogicHash })
    if (!bridgeLogic) {
      throw new ContractNotFoundError(deployBridgeLogicHash, 'bridgeLogic')
    }
    registry['bridgeLogic'] = bridgeLogic

    const { contractAddress: configuratorLogic } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployConfiguratorLogicHash,
    })
    if (!configuratorLogic) {
      throw new ContractNotFoundError(deployConfiguratorLogicHash, 'configuratorLogic')
    }
    registry['configuratorLogic'] = configuratorLogic

    const { contractAddress: poolLogic } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployPoolLogicHash })
    if (!poolLogic) {
      throw new ContractNotFoundError(deployPoolLogicHash, 'poolLogic')
    }
    registry['poolLogic'] = poolLogic

    const { contractAddress: aaveEcosystemReserveV2Proxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployInitializableAdminUpgradeabilityProxyHash,
    })
    if (!aaveEcosystemReserveV2Proxy) {
      throw new ContractNotFoundError(deployInitializableAdminUpgradeabilityProxyHash, 'aaveEcosystemReserveV2Proxy')
    }
    registry['aaveEcosystemReserveV2Proxy'] = aaveEcosystemReserveV2Proxy

    const { contractAddress: aaveEcosystemReserveController } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployAaveEcosystemReserveControllerHash,
    })
    if (!aaveEcosystemReserveController) {
      throw new ContractNotFoundError(deployAaveEcosystemReserveControllerHash, 'aaveEcosystemReserveController')
    }
    registry['aaveEcosystemReserveController'] = aaveEcosystemReserveController

    const { contractAddress: aaveEcosystemReserveV2Impl } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployAaveEcosystemReserveV2Hash,
    })
    if (!aaveEcosystemReserveV2Impl) {
      throw new ContractNotFoundError(deployAaveEcosystemReserveV2Hash, 'aaveEcosystemReserveV2Impl')
    }
    registry['aaveEcosystemReserveV2Impl'] = aaveEcosystemReserveV2Impl

    const { contractAddress: poolAddressesProvider } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPoolAddressProviderHash,
    })
    if (!poolAddressesProvider) {
      throw new ContractNotFoundError(deployPoolAddressProviderHash, 'poolAddressesProvider')
    }
    registry['poolAddressesProvider'] = poolAddressesProvider

    const { contractAddress: reservesSetupHelper } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployReservesSetupHelperHash,
    })
    if (!reservesSetupHelper) {
      throw new ContractNotFoundError(deployReservesSetupHelperHash, 'reservesSetupHelper')
    }
    registry['reservesSetupHelper'] = reservesSetupHelper

    const { contractAddress: walletBalanceProvider } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployWalletBalanceProviderHash,
    })
    if (!walletBalanceProvider) {
      throw new ContractNotFoundError(deployWalletBalanceProviderHash, 'walletBalanceProvider')
    }
    registry['walletBalanceProvider'] = walletBalanceProvider

    const { contractAddress: uiIncentiveDataProvider } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployUiIncentiveDataProviderV3Hash,
    })
    if (!uiIncentiveDataProvider) {
      throw new ContractNotFoundError(deployUiIncentiveDataProviderV3Hash, 'uiIncentiveDataProvider')
    }
    registry['uiIncentiveDataProvider'] = uiIncentiveDataProvider

    const { contractAddress: uiPoolDataProviderV3 } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployUiPoolDataProviderV3Hash,
    })
    if (!uiPoolDataProviderV3) {
      throw new ContractNotFoundError(deployUiPoolDataProviderV3Hash, 'uiPoolDataProviderV3')
    }
    registry['uiPoolDataProviderV3'] = uiPoolDataProviderV3

    const newMessage: DeployAaveV3Contracts_1SubActionMsg = {
      poolAddressesProviderRegistry: poolAddressesProviderRegistry,
      poolAddressesProvider: poolAddressesProvider,
      liquidationLogic: liquidationLogic,
      supplyLogic: supplyLogic,
      eModeLogic: eModeLogic,
      borrowLogic: borrowLogic,
      bridgeLogic: bridgeLogic,
      poolLogic: poolLogic,
      configuratorLogic: configuratorLogic,
      reservesSetupHelper: reservesSetupHelper,
      aaveEcosystemReserveController: aaveEcosystemReserveController,
      aaveEcosystemReserveV2Impl: aaveEcosystemReserveV2Impl,
      aaveEcosystemReserveV2Proxy: aaveEcosystemReserveV2Proxy,
      walletBalanceProvider: walletBalanceProvider,
      uiIncentiveDataProvider: uiIncentiveDataProvider,
      uiPoolDataProviderV3: uiPoolDataProviderV3,
    }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
