import { Address, zeroAddress } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { ATokenInitializeParams, ATokenInitializeTxBuilder } from '@actions/subactions/tx-builders/aToken/initialize'
import { InitializeAaveEcosystemReserveV2TxBuilder } from '@actions/subactions/tx-builders/aaveEcosystemReserveV2/initializeAaveEcosystemReserveV2'
import { AddPoolAdminACLManagerTxBuilder } from '@actions/subactions/tx-builders/aclManager/addPoolAdmin'
import {
  DelegationAwareATokenInitializeParams,
  DelegationAwareATokenInitializeTxBuilder,
} from '@actions/subactions/tx-builders/delegationAwareAToken/initialize'
import { SetRewardsControllerTxBuilder } from '@actions/subactions/tx-builders/emissionManager/setRewardsController'
import { InitializePool } from '@actions/subactions/tx-builders/pool/initialize'
import { SetACLManagerTxBuilder } from '@actions/subactions/tx-builders/poolAddressesProvider/setACLManager'
import { SetPoolDataProvider } from '@actions/subactions/tx-builders/poolAddressesProvider/setPoolDataProvider'
import { SetPriceOracleTxBuilder } from '@actions/subactions/tx-builders/poolAddressesProvider/setPriceOracle'
import { RegisterAddressProvider } from '@actions/subactions/tx-builders/poolAddressesProviderRegistry/registerAddressProvider'
import { UpdateFlashloanPremiumToProtocolTxBuilder } from '@actions/subactions/tx-builders/poolConfigurator/updateFlashloanPremiumToProtocol'
import { UpdateFlashloanPremiumTotalTxBuilder } from '@actions/subactions/tx-builders/poolConfigurator/updateFlashloanPremiumTotal'
import { InitializeRewardsControllerTxBuilder } from '@actions/subactions/tx-builders/rewardsController/initialize'
import {
  StableDebtTokenInitializeParams,
  StableDebtTokenInitializeTxBuilder,
} from '@actions/subactions/tx-builders/stableDebtToken/initialize'
import {
  VariableDebtTokenInitializeParams,
  VariableDebtTokenInitializeTxBuilder,
} from '@actions/subactions/tx-builders/variableDebtToken/initialize'

import { AaveV3Registry } from '@/src/type'

export type DeployAaveV3_Setup1SubActionParams = {
  aaveEcosystemReserveV2Impl: Address
  aaveEcosystemReserveV2Proxy: Address
  poolImpl: Address
  poolProxy: Address
  poolAddressesProvider: Address
  poolConfigurator: Address
  aclManager: Address // account
  poolAdmin: Address // account
  fundsAdmin: Address
  treasury: Address
  flashloanPremiumsTotal: bigint
  flashloanPremiumsProtocol: bigint
  aTokenInitializeParams: ATokenInitializeParams
  delegationAwareInitializeParams: DelegationAwareATokenInitializeParams
  stableDebtTokenInitializeParams: StableDebtTokenInitializeParams
  variableDebtTokenInitializeParams: VariableDebtTokenInitializeParams
  aaveProtocolDataProvider: Address
  poolAddressesProviderRegistry: Address
  providerId: bigint
  priceOracle: Address
  rewardsController: Address
  rewardsControllerImpl: Address
  emissionManager: Address
}

export class DeployAaveV3_Setup1SubAction extends SubAction<DeployAaveV3_Setup1SubActionParams, AaveV3Registry> {
  constructor(client: InfinitWallet, params: DeployAaveV3_Setup1SubActionParams) {
    super(DeployAaveV3_Setup1SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // (aclAdminSigner) addPoolAdmin
    const addPoolAdminACLManager = new AddPoolAdminACLManagerTxBuilder(this.client, {
      aclManager: this.params.aclManager,
      poolAdmin: this.client.walletClient.account.address,
    })
    this.txBuilders.push(addPoolAdminACLManager)
    // initialize aave ecosystem reserve v2 proxy
    const initializeProxyAaveEcosystemReserveV2SubAction = new InitializeAaveEcosystemReserveV2TxBuilder(this.client, {
      aaveEcosystemReserveV2: this.params.aaveEcosystemReserveV2Proxy,
      fundsAdmin: this.params.fundsAdmin,
      treasury: this.params.treasury,
    })
    this.txBuilders.push(initializeProxyAaveEcosystemReserveV2SubAction)

    // initialize aave ecosystem reserve v2 impl
    const initializeImplAaveEcosystemReserveV2SubAction = new InitializeAaveEcosystemReserveV2TxBuilder(this.client, {
      aaveEcosystemReserveV2: this.params.aaveEcosystemReserveV2Impl,
      fundsAdmin: this.params.fundsAdmin,
      treasury: this.params.treasury,
    })
    this.txBuilders.push(initializeImplAaveEcosystemReserveV2SubAction)

    // 3 initialize pool implementation
    const initializePoolImpl = new InitializePool(this.client, {
      pool: this.params.poolImpl,
      poolAddressesProvider: this.params.poolAddressesProvider,
    })
    this.txBuilders.push(initializePoolImpl)
    // 4 set ACLManager
    const setACLManager = new SetACLManagerTxBuilder(this.client, {
      poolAddressesProvider: this.params.poolAddressesProvider,
      aclManager: this.params.aclManager,
    })
    this.txBuilders.push(setACLManager)

    // 5 update flashloan premiumtotal
    const updateFlashLoanPremiumTotal = new UpdateFlashloanPremiumTotalTxBuilder(this.client, {
      poolConfig: this.params.poolConfigurator,
      flashloanPremiumsTotal: this.params.flashloanPremiumsTotal,
    })
    this.txBuilders.push(updateFlashLoanPremiumTotal)

    // 6 update flashloan to protocol
    const updateFlashLoanPremiumToProtocol = new UpdateFlashloanPremiumToProtocolTxBuilder(this.client, {
      poolConfig: this.params.poolConfigurator,
      flashloanPremiumsProtocol: this.params.flashloanPremiumsProtocol,
    })
    this.txBuilders.push(updateFlashLoanPremiumToProtocol)

    // 7 initialize atoken
    const initializeAToken = new ATokenInitializeTxBuilder(this.client, this.params.aTokenInitializeParams)
    this.txBuilders.push(initializeAToken)

    // 8 initialize delegation aware atoken
    const initializeDelegationAwareAToken = new DelegationAwareATokenInitializeTxBuilder(
      this.client,
      this.params.delegationAwareInitializeParams,
    )
    this.txBuilders.push(initializeDelegationAwareAToken)

    // 9 initialize stable debt atoken
    const initializeStableDebtToken = new StableDebtTokenInitializeTxBuilder(this.client, this.params.stableDebtTokenInitializeParams)
    this.txBuilders.push(initializeStableDebtToken)

    // 10 initialize variable debt atoken
    const initializeVariableDebtToken = new VariableDebtTokenInitializeTxBuilder(this.client, this.params.variableDebtTokenInitializeParams)
    this.txBuilders.push(initializeVariableDebtToken)

    // 11 set pool data provider
    const setPoolDataProvider = new SetPoolDataProvider(this.client, {
      poolAddressesProvider: this.params.poolAddressesProvider,
      aaveProtocolDataProvider: this.params.aaveProtocolDataProvider,
    })
    this.txBuilders.push(setPoolDataProvider)

    // 12 register pool address provider
    const registerPoolAddressesProvider = new RegisterAddressProvider(this.client, {
      providerId: this.params.providerId,
      poolAddressesProviderRegistry: this.params.poolAddressesProviderRegistry,
      poolAddressesProvider: this.params.poolAddressesProvider,
    })
    this.txBuilders.push(registerPoolAddressesProvider)

    // init oracle
    const setPriceOracle = new SetPriceOracleTxBuilder(this.client, {
      poolAddressesProvider: this.params.poolAddressesProvider,
      priceOracleSentinel: this.params.priceOracle,
    })
    this.txBuilders.push(setPriceOracle)

    // initialize incentives implementation
    const initializeIncentives = new InitializeRewardsControllerTxBuilder(this.client, {
      rewardsController: this.params.rewardsControllerImpl,
      emtyAddress: zeroAddress,
    })
    this.txBuilders.push(initializeIncentives)

    // emission manager: set rewards controller
    const setRewardsController = new SetRewardsControllerTxBuilder(this.client, {
      emissionManager: this.params.emissionManager,
      rewardsController: this.params.rewardsController,
    })
    this.txBuilders.push(setRewardsController)
  }

  public async updateRegistryAndMessage(registry: AaveV3Registry): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    return { newRegistry: registry, newMessage: {} }
  }
}
