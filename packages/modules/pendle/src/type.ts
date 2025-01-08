import { Address } from 'viem'

export type PendleRegistry = {
  pendleRouterV4?: Address
  routerStorageV4?: Address
  actionAddRemoveLiqV3?: Address
  actionCallbackV3?: Address
  actionMiscV3?: Address
  actionSimple?: Address
  actionSwapPTV3?: Address
  actionSwapYTV3?: Address
  pendleRouterStatic?: Address
  actionStorageStatic?: Address
  actionInfoStatic?: Address
  actionMarketAuxStatic?: Address
  actionMarketCoreStatic?: Address
  actionMintRedeemStatic?: Address
  actionVePendleStatic?: Address
  pendleLimitRouterImpl?: Address
  pendleLimitRouterProxy?: Address
  proxyAdmin?: Address
  baseSplitCodeFactoryContract?: Address
  oracleLib?: Address
  pendleGaugeControllerMainchainUpgImpl?: Address
  pendleGaugeControllerMainchainUpgProxy?: Address
  pendleMarketFactoryV3?: Address
  pendlePYLpOracle?: Address
  pendleSwap?: Address
  pendleYieldContractFactory?: Address
  votingEscrowPendleMainchain?: Address
  pendleMsgSendEndpointUpgImpl?: Address
  pendleMsgSendEndpointUpgProxy?: Address
  pendleVotingControllerUpgImpl?: Address
  pendleVotingControllerUpgProxy?: Address
  multicall?: Address
  pendleMulticallV2?: Address
  simulateHelper?: Address
  supplyCapReader?: Address
  pendlePoolDeployHelper?: Address
  pendleGovernanceProxy?: Address
  pendleGovernanceProxyImpl?: Address
  pendlePYLpOracleProxy?: Address
  pendleBoringOneracle?: Address
  feeVault?: Address
}
