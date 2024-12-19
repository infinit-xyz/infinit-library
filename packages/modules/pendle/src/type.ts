import { Address } from 'viem'

export type PendleV3Registry = {
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
  pendleLimitRouter?: Address
  pendleLimitRouterProxy?: Address
  proxyAdmin?: Address
  baseSplitCodeFactoryContract?: Address
  oracleLib?: Address
  pendleGaugeControllerMainchainUpg?: Address
  pendleMarketFactoryV3?: Address
  pendlePYLpOracle?: Address
  pendleSwap?: Address
  pendleYieldContractFactory?: Address
  votingEscrowPendleMainchain?: Address
  pendleMsgSendEndpointUpgImpl?: Address
  pendleMsgSendEndpointUpgProxy?: Address
  pendleVotingContollerUpgImpl?: Address
  pendleVotingControllerUpgProxy?: Address
}
