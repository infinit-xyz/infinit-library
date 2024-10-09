import { Address } from 'viem'

export type AaveV3Registry = {
  poolAddressProviderRegistry?: Address
  poolAddressesProvider?: Address
  liquidationLogic?: Address
  supplyLogic?: Address
  eModeLogic?: Address
  flashLoanLogic?: Address
  borrowLogic?: Address
  bridgeLogic?: Address
  poolLogic?: Address
  configuratorLogic?: Address
  reservesSetupHelper?: Address
  poolProxy?: Address
  lendingPools?: Record<string, LendingPool>
  walletBalanceProvider?: Address
  uiIncentiveDataProvider?: Address
  uiPoolDataProviderV3?: Address
  aaveProtocolDataProvider?: Address
  l2PoolImpl?: Address
  poolConfiguratorImpl?: Address
  aclManager?: Address
  aaveOracle?: Address
  aaveEcosystemReserveV2Proxy?: Address
  aaveEcosystemReserveController?: Address
  aaveEcosystemReserveV2Impl?: Address
  reserveInterestRateStrategies?: Record<string, Address>
  wrappedTokenGatewayV3?: Address
  l2Encoder?: Address
  aTokenImpl?: Address
  delegationAwareATokenImpl?: Address
  stableDebtTokenImpl?: Address
  variableDebtTokenImpl?: Address
  poolConfiguratorProxy?: Address
  rewardsControllerImpl?: Address
  rewardsControllerProxy?: Address
  pullRewardsTransferStrategy?: Address
  emissionManager?: Address
  aggregatorApi3Adapters?: Record<string, Address>
  aggregatorPythAdapters?: Record<string, Address>
  aggregatorBandAdapters?: Record<string, Address>
}

export type LendingPool = {
  underlyingToken: Address
  interestRateStrategy: Address
  aToken: Address
  stableDebtToken: Address
  variableDebtToken: Address
}

export type Modify<T, R> = Omit<T, keyof R> & R
