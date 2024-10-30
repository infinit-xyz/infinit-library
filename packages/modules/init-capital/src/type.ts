import { Address } from 'viem'

export type InitCapitalRegistry = {
  feeVault?: Address
  proxyAdmin?: Address
  accessControlManager?: Address
  api3ProxyOracleReaderProxy?: Address
  initOracleProxy?: Address
  configProxy?: Address
  liqIncentiveCalculatorProxy?: Address
  posManagerProxy?: Address
  initCoreProxy?: Address
  riskManagerProxy?: Address
  lsdApi3ProxyOracleReaderProxy?: Address
  pythOracleReaderProxy?: Address
  moneyMarketHookProxy?: Address
  initLens?: Address
  api3ProxyOracleReaderImpl?: Address
  initOracleImpl?: Address
  configImpl?: Address
  liqIncentiveCalculatorImpl?: Address
  posManagerImpl?: Address
  initCoreImpl?: Address
  riskManagerImpl?: Address
  lsdApi3ProxyOracleReaderImpl?: Address
  pythOracleReaderImpl?: Address
  moneyMarketHookImpl?: Address
  lendingPoolImpl?: Address
  irms?: Record<string, Address>
  lendingPools?: Record<string, LendingPool>
}

export type LendingPool = {
  underlyingToken: Address
  lendingPool: Address
  irm: Address
}
