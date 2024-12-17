import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress, zodAddressNonZero } from '@infinit-xyz/core/internal'

import {
  DeployBaseSplitCodeFactoryContractSubaction,
  DeployBaseSplitCodeFactoryContractSubactionMsg,
} from '@actions/subactions/deployBaseSplitCodeFactoryContract'
import {
  DeployPendleMsgSendEndpointUpgSubaction,
  DeployPendleMsgSendEndpointUpgSubactionMsg,
} from '@actions/subactions/deployPendleMsgSendEndpointUpg'
import {
  DeployPendleMsgSendEndpointUpgProxySubaction,
  DeployPendleMsgSendEndpointUpgProxySubactionMsg,
} from '@actions/subactions/deployPendleMsgSendEndpointUpgProxy'
import { DeployPendleSwapSubaction } from '@actions/subactions/deployPendleSwap'
import {
  DeployPendleYieldContractFactorySubaction,
  DeployPendleYieldContractFactorySubactionMsg,
} from '@actions/subactions/deployPendleYieldContractFactory'
import { DeployVotingEscrowPendleMainchainSubaction } from '@actions/subactions/deployVotingEscrowPendleMainchain'
import { DeployYTV3CreationCodeSubaction, DeployYTV3CreationCodeSubactionMsg } from '@actions/subactions/deployYTV3CreationCode'
import { InitializePendleMsgSendEndpointUpgSubaction } from '@actions/subactions/initializePendleMsgSendEndpointUpg'
import { InitializePendleYieldContractFactorySubaction } from '@actions/subactions/initializePendleYieldContractFactory'

import { DeployOracleLibSubaction, DeployOracleLibSubactionMsg } from './subactions/deployOracleLib'
import { DeployPendleMarketFactoryV3Subaction } from './subactions/deployPendleMarketFactoryV3'
import {
  DeployPendleMarketV3CreationCodeSubaction,
  DeployPendleMarketV3CreationCodeSubactionMsg,
} from './subactions/deployPendleMarketV3CreationCode'
import type { PendleV3Registry } from '@/src/type'

export const DeployPendleV3ParamsSchema = z.object({
  refundAddress: zodAddressNonZero.describe(`The address to refund e.g. '0x123...abc'`),
  lzEndpoint: zodAddress.describe(`The address of the LZ endpoint e.g. '0x123...abc'`),
  governanceToken: zodAddress.describe(`The address of the governance token e.g. '0x123...abc'`),
  initialApproxDestinationGas: z.bigint().describe(`The initial gas for the destination`),
  treasury: zodAddressNonZero.describe(`The address of the treasury e.g. '0x123...abc'`),
  yieldContractFactory: z.object({
    expiryDivisor: z
      .bigint()
      .describe(
        `The divisor for expiry timestamp, e.g. 86400n. it will be use furture for create a pair of (PT, YT) as timestamp = expiry / expiryDivisor`,
      ),
    interestFeeRate: z
      .bigint()
      .describe(`The fee rate for the interest in 1e18 unit, e.g. BigInt(0.1e18) is 10%. NOTE: Maximum is BigInt(0.2e18) (20%)`),
    rewardFeeRate: z
      .bigint()
      .describe(`The fee rate for the reward in 1e18 uint, e.g. BigInt(0.1e18) is 10%. NOTE: Maximum is BigInt(0.2e18) (20%)`),
  }),
  marketContractFactory: z.object({
    reserveFeePercent: z
      .number()
      .describe(`The reserve fee percent in 1e18 unit, e.g. BigInt(0.1e18) is 10%. NOTE: should be between 0-100 `),
    vePendle: zodAddressNonZero.describe(`The address of the vePendle e.g. '0x123...abc'`),
    guaugeController: zodAddressNonZero.describe(`The address of the guage controller e.g. '0x123...abc'`),
  }),
})

export type DeployPendleV3Params = z.infer<typeof DeployPendleV3ParamsSchema>
export type DeployPendleV3ActionData = {
  params: DeployPendleV3Params
  signer: Record<'deployer', InfinitWallet>
}

export class DeployPendleV3Action extends Action<DeployPendleV3ActionData, PendleV3Registry> {
  constructor(data: DeployPendleV3ActionData) {
    validateActionData(data, DeployPendleV3ParamsSchema, ['deployer'])
    super(DeployPendleV3Action.name, data)
  }

  protected override getSubActions(): ((message: any) => SubAction)[] {
    const deployer: InfinitWallet = this.data.signer.deployer
    const params = this.data.params

    return [
      // step 1: deploy BaseSplitCodeFactoryContract
      () => new DeployBaseSplitCodeFactoryContractSubaction(deployer),

      // step 2: deploy PendleSwap
      () => new DeployPendleSwapSubaction(deployer),

      // step 3: deploy PendleMsgSendEndpointUpg
      // step 3.1: deploy implementation
      () =>
        new DeployPendleMsgSendEndpointUpgSubaction(deployer, {
          refundAddress: params.refundAddress,
          lzEndpoint: params.lzEndpoint,
        }),
      // step 3.2: deploy proxy ERC1967
      (message: DeployPendleMsgSendEndpointUpgSubactionMsg) =>
        new DeployPendleMsgSendEndpointUpgProxySubaction(deployer, {
          implementation: message.pendleMsgSendEndpointUpg,
          data: '0x',
        }),
      // step 3.3: initialize proxy
      (message: DeployPendleMsgSendEndpointUpgProxySubactionMsg) =>
        new InitializePendleMsgSendEndpointUpgSubaction(deployer, {
          pendleMsgSendEndpointUpg: message.pendleMsgSendEndpointUpgProxy,
        }),

      // step 4:
      (message: DeployPendleMsgSendEndpointUpgProxySubactionMsg) =>
        new DeployVotingEscrowPendleMainchainSubaction(deployer, {
          pendle: params.governanceToken,
          pendleMsgSendEndpoint: message.pendleMsgSendEndpointUpgProxy,
          initialApproxDestinationGas: params.initialApproxDestinationGas,
        }),

      // TODO: step 5: deploy unverified contract

      // step 6: deploy v3-yt in BaseSplitContractFactory
      (message: DeployBaseSplitCodeFactoryContractSubactionMsg) =>
        new DeployYTV3CreationCodeSubaction(deployer, {
          baseSplitCodeFactoryContact: message.baseSplitCodeFactoryContract,
        }),

      // step 7: deploy PendleYieldContractFactory
      // step 7.1: deploy PendleYieldContractFactory
      (message: DeployYTV3CreationCodeSubactionMsg) =>
        new DeployPendleYieldContractFactorySubaction(deployer, {
          ytCreationCodeContractA: message.ytV3CreationCodeContractA,
          ytCreationCodeSizeA: message.ytV3CreationCodeContractSizeA,
          ytCreationCodeContractB: message.ytCreationCodeContractB,
          ytCreationCodeSizeB: message.ytCreationCodeSizeB,
        }),
      // step 7.2: initialize PendleYieldContractFactory
      (message: DeployPendleYieldContractFactorySubactionMsg) =>
        new InitializePendleYieldContractFactorySubaction(deployer, {
          pendleYieldContractFactory: message.pendleYieldContractFactory,
          expiryDivisor: params.yieldContractFactory.expiryDivisor,
          interestFeeRate: params.yieldContractFactory.interestFeeRate,
          rewardFeeRate: params.yieldContractFactory.rewardFeeRate,
          treasury: params.treasury,
        }),
      // step 8: deploy oracleLib
      () => new DeployOracleLibSubaction(deployer),

      // step 9: deploy v3-Lp in BaseSplitContractFactory
      (message: DeployBaseSplitCodeFactoryContractSubactionMsg & DeployOracleLibSubactionMsg) => {
        return new DeployPendleMarketV3CreationCodeSubaction(deployer, {
          oracleLib: message.oracleLib,
          baseSplitCodeFactoryContact: message.baseSplitCodeFactoryContract,
        })
      },
      // step 10: deploy PendleMarketFactoryV3
      (message: DeployPendleMarketV3CreationCodeSubactionMsg & DeployPendleYieldContractFactorySubactionMsg) =>
        new DeployPendleMarketFactoryV3Subaction(deployer, {
          yieldContractFactory: message.pendleYieldContractFactory,
          marketCreationCodeContractA: message.pendleMarketV3CreationCodeContractA,
          marketCreationCodeSizeA: message.pendleMarketV3CreationCodeSizeA,
          marketCreationCodeContractB: message.pendleMarketV3CreationCodeContractB,
          marketCreationCodeSizeB: message.pendleMarketV3CreationCodeSizeB,
          treasury: params.treasury,
          reserveFeePercent: params.marketContractFactory.reserveFeePercent,
          vePendle: params.marketContractFactory.vePendle,
          guaugeController: params.marketContractFactory.guaugeController,
        }),
    ]
  }
}
