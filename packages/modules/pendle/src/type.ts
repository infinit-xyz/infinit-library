import { Address } from 'viem'

export type PendleV3Registry = {
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
