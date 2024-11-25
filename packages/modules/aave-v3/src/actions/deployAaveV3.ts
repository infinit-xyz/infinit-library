import { z } from 'zod'

import { zeroAddress } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { DeployAaveV3Contracts_1SubAction, DeployAaveV3Contracts_1SubActionMsg } from '@actions/subactions/deployAaveV3Contracts_1'
import { DeployAaveV3Contracts_2SubAction, DeployAaveV3Contracts_2SubActionMsg } from '@actions/subactions/deployAaveV3Contracts_2'
import { DeployAaveV3Contracts_3SubAction, DeployAaveV3Contracts_3SubActionMsg } from '@actions/subactions/deployAaveV3Contracts_3'
import { DeployAaveV3Contracts_4SubAction, DeployAaveV3Contracts_4SubActionMsg } from '@actions/subactions/deployAaveV3Contracts_4'
import { DeployAaveV3Contracts_5SubAction, DeployAaveV3Contracts_5SubActionMsg } from '@actions/subactions/deployAaveV3Contracts_5'
import { DeployAaveV3_Setup1SubAction } from '@actions/subactions/deployAaveV3_Setup1'
import { DeployAaveV3_Setup2SubAction } from '@actions/subactions/deployAaveV3_Setup2'
import { DefaultReserveInterestRateStrategyConfig } from '@actions/subactions/deployDefaultReserveInterestRateStrategy'
import { DeployDefaultReserveInterestRateStrategyTxBuilderParams } from '@actions/subactions/tx-builders/defaultReserveInterestRateStrategy/deployDefaultReserveInterestRateStrategy'

import type { AaveV3Registry, Modify } from '@/src/type'

type DeployDefaultReserveInterestRateStrategyActionParams = Modify<
  DefaultReserveInterestRateStrategyConfig,
  {
    params: Omit<DeployDefaultReserveInterestRateStrategyTxBuilderParams, 'poolAddressesProvider'>
  }
>

export const DeployAaveV3ParamsSchema = z.object({
  marketId: z.string().describe(`Unique identifier for the AAVE market e.g. 'INFINIT-LENDING'`),
  providerId: z.bigint().describe(`Unique identifier for the addresses provider e.g. 1n`),
  treasuryOwner: zodAddress.describe(`Address of the treasury owner, managing protocol funds e.g. '0x123...abc'`),
  addressesProviderOwner: zodAddress.describe(`Address of the owner managing the address provider e.g. '0x123...abc'`),
  addressesProviderRegistryOwner: zodAddress.describe(`Address of the owner managing the address provider registry e.g. '0x123...abc'`),
  wrappedTokenGatewayOwner: zodAddress.describe(`Address of the owner of the wrapped token gateway e.g. '0x123...abc'`),
  emissionManagerOwner: zodAddress.describe(`Address of the owner managing the emission manager e.g. '0x123...abc'`),
  aclAdmin: zodAddress.describe(`Address of the Access Control List admin, managing protocol access e.g. '0x123...abc'`),
  fundsAdmin: zodAddress.describe(`Address of the funds admin, managing funds distribution e.g. '0x123...abc'`),
  poolAdmin: zodAddress.describe(`Address of the pool admin, managing lending pool settings e.g. '0x123...abc'`),
  emergencyAdmin: zodAddress.describe(`Address of the emergency admin, handling emergencies e.g. '0x123...abc'`),
  rewardsAdmin: zodAddress.describe(`Address of the rewards admin, managing rewards distribution e.g. '0x123...abc'`),
  rewardsHolder: zodAddress.describe(`Address of the rewards holder, e.g. '0x123...abc'`),
  flashloanPremiumsTotal: z.bigint().describe(`Total flash loan premium rate in bps e.g. 50n`),
  flashloanPremiumsProtocol: z.bigint().describe(`Portion of flash loan premium for the protocol in bps e.g. 50n`),
  chainlinkAggProxy: zodAddress.describe(`Address of the Chainlink aggregator proxy for price data e.g. '0x123...abc'`),
  chainlinkETHUSDAggProxy: zodAddress.describe(`Address of the Chainlink ETH/USD price feed proxy e.g. '0x123...abc'`),
  assets: z.array(zodAddress).describe(`List of supported asset addresses`),
  sources: z.array(zodAddress).describe(`List of price feed source addresses`),
  fallbackOracle: zodAddress.optional().describe(`Address of the fallback oracle for backup price feeds e.g. '0x123...abc'`),
  baseCurrency: zodAddress.describe(`Base token address of the protocol e.g. '0x123...abc'`),
  baseCurrencyUnit: z.bigint().describe(`Smallest unit of the base currency e.g. 1n`),
  defaultReserveInterestRateStrategyConfigs: z
    .custom<DeployDefaultReserveInterestRateStrategyActionParams[]>()
    .describe(`Default interest rate strategy configuration address`),
  wrappedNativeToken: zodAddress.describe(`Address of the wrapped native token e.g. '0x123...abc'`),
})

export type DeployAaveV3Params = z.infer<typeof DeployAaveV3ParamsSchema>

export type DeployAaveV3ActionData = {
  params: DeployAaveV3Params
  signer: Record<'deployer', InfinitWallet>
}

export class DeployAaveV3Action extends Action<DeployAaveV3ActionData, AaveV3Registry> {
  constructor(data: DeployAaveV3ActionData) {
    validateActionData(data, DeployAaveV3ParamsSchema, ['deployer'])
    super(DeployAaveV3Action.name, data)
  }

  protected getSubActions(): ((message: any) => SubAction)[] {
    const deployer: InfinitWallet = this.data.signer['deployer']
    const params = this.data.params

    return [
      // step 1
      () =>
        new DeployAaveV3Contracts_1SubAction(deployer, {
          treasuryOwner: params.treasuryOwner,
          marketId: params.marketId,
          chainlinkAggProxy: params.chainlinkAggProxy,
          chainlinkETHUSDAggProxy: params.chainlinkETHUSDAggProxy,
          emissionManagerOwner: params.emissionManagerOwner,
        }),
      // step 2
      (message: DeployAaveV3Contracts_1SubActionMsg) =>
        new DeployAaveV3Contracts_2SubAction(deployer, {
          poolAddressesProvider: message.poolAddressesProvider,
          aclAdmin: params.aclAdmin,
          borrowLogic: message.borrowLogic,
          configuratorLogic: message.configuratorLogic,
          treasuryOwner: params.treasuryOwner,
          aaveEcosystemReserveController: message.aaveEcosystemReserveController,
          wrappedNativeToken: params.wrappedNativeToken,
          assets: params.assets,
          sources: params.sources,
          fallbackOracle: params.fallbackOracle,
          baseCurrency: params.baseCurrency,
          baseCurrencyUnit: params.baseCurrencyUnit,
          emissionManager: message.emissionManager,
          defaultReserveInterestRateStrategyConfigs: params.defaultReserveInterestRateStrategyConfigs.map(({ name, params }) => ({
            name,
            params: { ...params, poolAddressesProvider: message.poolAddressesProvider },
          })),
        }),
      // step 3
      (message: DeployAaveV3Contracts_1SubActionMsg & DeployAaveV3Contracts_2SubActionMsg) =>
        new DeployAaveV3Contracts_3SubAction(deployer, {
          poolAddressesProvider: message.poolAddressesProvider,
          liquidationLogic: message.liquidationLogic,
          supplyLogic: message.supplyLogic,
          eModeLogic: message.eModeLogic,
          flashLoanLogic: message.flashLoanLogic,
          borrowLogic: message.borrowLogic,
          bridgeLogic: message.bridgeLogic,
          poolLogic: message.poolLogic,
        }),

      // step 4
      (message: DeployAaveV3Contracts_1SubActionMsg & DeployAaveV3Contracts_2SubActionMsg & DeployAaveV3Contracts_3SubActionMsg) =>
        new DeployAaveV3Contracts_4SubAction(deployer, {
          poolAddressesProvider: message.poolAddressesProvider,
          poolImpl: message.l2PoolImpl,
          poolConfiguratorImpl: message.poolConfiguratorImpl,
          rewardsControllerImpl: message.rewardsControllerImpl,
        }),

      // step 5
      (
        message: DeployAaveV3Contracts_1SubActionMsg &
          DeployAaveV3Contracts_2SubActionMsg &
          DeployAaveV3Contracts_3SubActionMsg &
          DeployAaveV3Contracts_4SubActionMsg,
      ) =>
        new DeployAaveV3Contracts_5SubAction(deployer, {
          poolAddressesProvider: message.poolAddressesProvider,
          wrappedNativeToken: params.wrappedNativeToken,
          wrappedTokenGatewayOwner: params.wrappedTokenGatewayOwner,
          poolProxy: message.poolProxy,
          incentivesController: message.rewardsControllerProxy,
          rewardsAdmin: params.rewardsAdmin,
          rewardsHolder: params.rewardsHolder,
        }),

      // step 6
      (
        message: DeployAaveV3Contracts_1SubActionMsg &
          DeployAaveV3Contracts_2SubActionMsg &
          DeployAaveV3Contracts_3SubActionMsg &
          DeployAaveV3Contracts_4SubActionMsg &
          DeployAaveV3Contracts_5SubActionMsg,
      ) =>
        new DeployAaveV3_Setup1SubAction(deployer, {
          aaveEcosystemReserveV2Impl: message.aaveEcosystemReserveV2Impl,
          aaveEcosystemReserveV2Proxy: message.aaveEcosystemReserveV2Proxy,
          poolImpl: message.l2PoolImpl,
          poolProxy: message.poolProxy,
          poolAddressesProvider: message.poolAddressesProvider,
          poolConfigurator: message.poolConfiguratorProxy,
          aclManager: message.aclManager,
          fundsAdmin: params.fundsAdmin,
          emissionManager: message.emissionManager,
          treasury: message.feeVault,
          flashloanPremiumsTotal: params.flashloanPremiumsTotal,
          flashloanPremiumsProtocol: params.flashloanPremiumsProtocol,
          rewardsController: message.rewardsControllerProxy,
          rewardsControllerImpl: message.rewardsControllerImpl,
          aTokenInitializeParams: {
            aToken: message.aToken,
            pool: message.poolProxy,
            treasury: zeroAddress,
            underlyingAsset: zeroAddress,
            incentivesController: zeroAddress,
            aTokenDecimals: 0,
            aTokenName: 'ATOKEN_IMPL',
            aTokenSymbol: 'ATOKEN_IMPL',
            params: '0x00',
          },
          delegationAwareInitializeParams: {
            aToken: message.delegationAwareAToken,
            pool: message.poolProxy,
            treasury: zeroAddress,
            underlyingAsset: zeroAddress,
            incentivesController: zeroAddress,
            aTokenDecimals: 0,
            aTokenName: 'DELEGATION_AWARE_ATOKEN_IMPL',
            aTokenSymbol: 'DELEGATION_AWARE_ATOKEN_IMPL',
            params: '0x00',
          },
          stableDebtTokenInitializeParams: {
            stableDebtToken: message.stableDebtToken,
            pool: message.poolProxy,
            underlyingAsset: zeroAddress,
            incentivesController: zeroAddress,
            debtTokenDecimals: 0,
            debtTokenName: 'STABLE_DEBT_TOKEN_IMPL',
            debtTokenSymbol: 'STABLE_DEBT_TOKEN_IMPL',
            params: '0x00',
          },
          variableDebtTokenInitializeParams: {
            variableDebtToken: message.variableDebtToken,
            pool: message.poolProxy,
            underlyingAsset: zeroAddress,
            incentivesController: zeroAddress,
            debtTokenDecimals: 0,
            debtTokenName: 'VARIABLE_DEBT_TOKEN_IMPL',
            debtTokenSymbol: 'VARIABLE_DEBT_TOKEN_IMPL',
            params: '0x00',
          },
          aaveProtocolDataProvider: message.aaveProtocolDataProvider,
          poolAddressesProviderRegistry: message.poolAddressesProviderRegistry,
          providerId: params.providerId,
          priceOracle: message.aaveOracle,
          poolAdmin: params.poolAdmin,
        }),

      // step 7
      (message: DeployAaveV3Contracts_1SubActionMsg & DeployAaveV3Contracts_2SubActionMsg) =>
        new DeployAaveV3_Setup2SubAction(deployer, {
          poolAddressesProviderRegistry: message.poolAddressesProviderRegistry,
          poolAddressesProvider: message.poolAddressesProvider,
          reservesSetupHelper: message.reservesSetupHelper,
          aclManager: message.aclManager,
          emissionManager: message.emissionManager,
          emissionManagerOwner: params.emissionManagerOwner,
          addressesProviderRegistryOwner: params.addressesProviderRegistryOwner,
          addressesProviderOwner: params.addressesProviderOwner,
          aclAdmin: params.aclAdmin,
          poolAdmin: params.poolAdmin,
          emergencyAdmin: params.emergencyAdmin,
          deployer: deployer.walletClient.account.address,
        }),
    ]
  }
}
