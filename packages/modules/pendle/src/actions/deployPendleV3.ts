import { z } from 'zod'

import { zeroAddress } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress, zodAddressNonZero } from '@infinit-xyz/core/internal'

import {
  DeployBaseSplitCodeFactoryContractSubaction,
  DeployBaseSplitCodeFactoryContractSubactionMsg,
} from '@actions/on-chain/subactions/deployBaseSplitCodeFactoryContract'
import { DeployOracleLibSubaction, DeployOracleLibSubactionMsg } from '@actions/on-chain/subactions/deployOracleLib'
import { DeployPendleGaugeControllerMainchainUpgSubaction } from '@actions/on-chain/subactions/deployPendleGaugeControllerMainchainUpg'
import {
  DeployPendleLimitRouterMsg,
  DeployPendleLimitRouterSubAction,
  DeployPendleLimitRouterSubactionParams,
} from '@actions/on-chain/subactions/deployPendleLimitRouter'
import {
  DeployPendleLimitRouterProxyMsg,
  DeployPendleLimitRouterProxySubAction,
  DeployPendleLimitRouterProxySubActionParams,
} from '@actions/on-chain/subactions/deployPendleLimitRouterProxy'
import {
  DeployPendleMarketFactoryV3Subaction,
  DeployPendleMarketFactoryV3SubactionMsg,
} from '@actions/on-chain/subactions/deployPendleMarketFactoryV3'
import {
  DeployPendleMarketV3CreationCodeSubaction,
  DeployPendleMarketV3CreationCodeSubactionMsg,
} from '@actions/on-chain/subactions/deployPendleMarketV3CreationCode'
import {
  DeployPendleMsgSendEndpointUpgSubaction,
  DeployPendleMsgSendEndpointUpgSubactionMsg,
} from '@actions/on-chain/subactions/deployPendleMsgSendEndpointUpg'
import {
  DeployPendleMsgSendEndpointUpgProxySubaction,
  DeployPendleMsgSendEndpointUpgProxySubactionMsg,
} from '@actions/on-chain/subactions/deployPendleMsgSendEndpointUpgProxy'
import { DeployPendleRouterStaticMsg, DeployPendleRouterStaticSubAction } from '@actions/on-chain/subactions/deployPendleRouterStatic'
import { DeployPendleRouterV4Msg, DeployPendleRouterV4SubAction } from '@actions/on-chain/subactions/deployPendleRouterV4'
import { DeployPendleSwapSubaction } from '@actions/on-chain/subactions/deployPendleSwap'
import {
  DeployPendleVotingContollerUpgSubaction,
  DeployPendleVotingContollerUpgSubactionMsg,
} from '@actions/on-chain/subactions/deployPendleVotingControllerUpg'
import {
  DeployPendleVotingControllerUpgProxySubaction,
  DeployPendleVotingControllerUpgProxySubactionMsg,
} from '@actions/on-chain/subactions/deployPendleVotingControllerUpgProxy'
import {
  DeployPendleYieldContractFactorySubaction,
  DeployPendleYieldContractFactorySubactionMsg,
} from '@actions/on-chain/subactions/deployPendleYieldContractFactory'
import { DeployPendleRouterFacetsMsg, DeployPendleRouterFacetsSubAction } from '@actions/on-chain/subactions/deployRouterFacets'
import { DeployPendleStaticFacetsMsg, DeployPendleStaticFacetsSubAction } from '@actions/on-chain/subactions/deployRouterStaticFacets'
import {
  DeployVotingEscrowPendleMainchainSubaction,
  DeployVotingEscrowPendleMainchainSubactionMsg,
} from '@actions/on-chain/subactions/deployVotingEscrowPendleMainchain'
import { DeployYTV3CreationCodeSubaction, DeployYTV3CreationCodeSubactionMsg } from '@actions/on-chain/subactions/deployYTV3CreationCode'
import { InitializePendleMsgSendEndpointUpgSubaction } from '@actions/on-chain/subactions/initializePendleMsgSendEndpointUpg'
import { InitializePendleVotingControllerUpgSubaction } from '@actions/on-chain/subactions/initializePendleVotingControllerUpg'
import { InitializePendleYieldContractFactorySubaction } from '@actions/on-chain/subactions/initializePendleYieldContractFactory'
import { SetPendleRouterStaticFacetsSubAction } from '@actions/on-chain/subactions/setPendleRouterStaticFacets'
import { SetPendleRouterV4FacetsSubAction } from '@actions/on-chain/subactions/setPendleRouterV4Facets'

import { DeployProxyAdminMsg, DeployProxyAdminSubAction } from './on-chain/subactions/deployProxyAdmin'
import { InitializePendleLimitRouterSubaction } from './on-chain/subactions/initializePendleLimitRouter'
import type { PendleV3Registry } from '@/src/type'

export const DeployPendleV3ActionParamsSchema = z.object({
  refundAddress: zodAddressNonZero.describe(`The address to refund e.g. '0x123...abc'`),
  lzEndpoint: zodAddress.describe(`The address of the LZ endpoint e.g. '0x123...abc'`),
  governanceToken: zodAddress.describe(`The address of the governance token e.g. '0x123...abc'`),
  initialApproxDestinationGas: z.bigint().describe(`The initial gas for the destination`),
  treasury: zodAddressNonZero.describe(`The address of the treasury e.g. '0x123...abc'`),
  rewardToken: zodAddressNonZero.describe(`The address of the reward token e.g. '0x123...abc'`),
  feeRecipient: zodAddressNonZero.describe(`The address of the fee recipient e.g. '0x123...abc'`),
  wrappedNativetoken: zodAddressNonZero.describe(`The address of the wrapped native token e.g. '0x123...abc'`),
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
    guaugeController: zodAddressNonZero.describe(`The address of the guage controller e.g. '0x123...abc'`),
  }),
})

export type DeployPendleV3Params = z.infer<typeof DeployPendleV3ActionParamsSchema>
export type DeployPendleV3ActionData = {
  params: DeployPendleV3Params
  signer: Record<'deployer', InfinitWallet>
}

export class DeployPendleV3Action extends Action<DeployPendleV3ActionData, PendleV3Registry> {
  constructor(data: DeployPendleV3ActionData) {
    validateActionData(data, DeployPendleV3ActionParamsSchema, ['deployer'])
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
      (
        message: DeployPendleMarketV3CreationCodeSubactionMsg &
          DeployPendleYieldContractFactorySubactionMsg &
          DeployVotingEscrowPendleMainchainSubactionMsg,
      ) =>
        new DeployPendleMarketFactoryV3Subaction(deployer, {
          yieldContractFactory: message.pendleYieldContractFactory,
          marketCreationCodeContractA: message.pendleMarketV3CreationCodeContractA,
          marketCreationCodeSizeA: message.pendleMarketV3CreationCodeSizeA,
          marketCreationCodeContractB: message.pendleMarketV3CreationCodeContractB,
          marketCreationCodeSizeB: message.pendleMarketV3CreationCodeSizeB,
          treasury: params.treasury,
          reserveFeePercent: params.marketContractFactory.reserveFeePercent,
          vePendle: message.votingEscrowPendleMainchain,
          guaugeController: params.marketContractFactory.guaugeController,
        }),

      // step 11: deploy PendleVotingControllerUpg
      // step 11.1: deploy implementation
      (message: DeployPendleMsgSendEndpointUpgProxySubactionMsg & DeployVotingEscrowPendleMainchainSubactionMsg) =>
        new DeployPendleVotingContollerUpgSubaction(deployer, {
          vePendle: message.votingEscrowPendleMainchain,
          pendleMsgSendEndpoint: message.pendleMsgSendEndpointUpgProxy,
          initialApproxDestinationGas: params.initialApproxDestinationGas,
        }),
      // step 11.2: deploy proxy
      (message: DeployPendleVotingContollerUpgSubactionMsg) =>
        new DeployPendleVotingControllerUpgProxySubaction(deployer, {
          implementation: message.pendleVotingContollerUpgImpl,
          data: '0x',
        }),
      // step 11.3: initialize proxy
      (message: DeployPendleVotingControllerUpgProxySubactionMsg) =>
        new InitializePendleVotingControllerUpgSubaction(deployer, {
          pendleVotingControllerUpg: message.pendleVotingControllerUpgProxy,
        }),

      // step 12: deploy PendleGaugeControllerMainchainUpg
      (message: DeployPendleMarketFactoryV3SubactionMsg & DeployPendleVotingControllerUpgProxySubactionMsg) =>
        new DeployPendleGaugeControllerMainchainUpgSubaction(deployer, {
          votingController: message.pendleVotingControllerUpgProxy,
          pendle: params.rewardToken,
          marketFactory: zeroAddress,
          marketFactory2: zeroAddress,
          marketFactory3: zeroAddress,
          marketFactory4: message.pendleMarketFactoryV3,
        }),

      // step 13 deploy RouterV4 Facets
      () => new DeployPendleRouterFacetsSubAction(deployer, {}),

      // step 14 deploy RouterV4
      (message: DeployPendleRouterFacetsMsg) =>
        new DeployPendleRouterV4SubAction(deployer, {
          owner: deployer.walletClient.account.address,
          routerStorageV4: message.routerStorageV4,
        }),

      // step 15: set pendleRouterV4 selectorToFacets
      (message: DeployPendleRouterV4Msg & DeployPendleRouterFacetsMsg) =>
        new SetPendleRouterV4FacetsSubAction(deployer, {
          pendleRouterV4: message.pendleRouterV4,
          actionStorageV4: message.routerStorageV4,
          actionAddRemoveLiqV3: message.actionAddRemoveLiqV3,
          actionCallbackV3: message.actionCallbackV3,
          actionMiscV3: message.actionMiscV3,
          actionSimple: message.actionSimple,
          actionSwapPTV3: message.actionSwapPTV3,
          actionSwapYTV3: message.actionSwapYTV3,
        }),

      // step 16: deploy PendleRouterStatic Facets
      (message: DeployPendleVotingControllerUpgProxySubactionMsg) =>
        new DeployPendleStaticFacetsSubAction(deployer, {
          owner: deployer.walletClient.account.address,
          vePendle: message.pendleVotingControllerUpgProxy,
        }),

      // step 17: deploy PendleRouterStatic
      (message: DeployPendleStaticFacetsMsg) =>
        new DeployPendleRouterStaticSubAction(deployer, {
          actionStorageStatic: message.actionStorageStatic,
        }),

      // step 18: set PendleRouterStatic selectorToFacets
      (message: DeployPendleRouterStaticMsg) =>
        new SetPendleRouterStaticFacetsSubAction(deployer, {
          pendleRouterStatic: message.pendleRouterStatic,
          actionStorageStatic: message.pendleRouterStatic,
          actionInfoStatic: message.pendleRouterStatic,
          actionMarketAuxStatic: message.pendleRouterStatic,
          actionMarketCoreStatic: message.pendleRouterStatic,
          actionMintRedeemStatic: message.pendleRouterStatic,
          actionVePendleStatic: message.pendleRouterStatic,
        }),
      // step 19: deploy reflector (TODO: find out what is this?)
      // step 20: deploy ProxyAdmin
      () => new DeployProxyAdminSubAction(deployer, {}),

      // step 21: deploy PendleLimitRouter
      // step 21.1: deploy implementation
      () =>
        new DeployPendleLimitRouterSubAction(deployer, {
          wrappedNativeToken: params.wrappedNativetoken,
        }),
      // step 21.2: deploy proxy
      (message: DeployProxyAdminMsg & DeployPendleLimitRouterMsg) =>
        new DeployPendleLimitRouterProxySubAction(deployer, {
          proxyAdmin: message.proxyAdmin,
          pendleLimitRouterImpl: message.pendleLimitRouter,
        }),
      // step 21.3: initialize proxy
      (message: DeployPendleLimitRouterProxyMsg) => {
        return new InitializePendleLimitRouterSubaction(deployer, {
          pendleLimitRouter: message.pendleLimitRouterProxy,
          feeRecipient: params.feeRecipient,
        })
      },

      // step 22: deploy PendleLpOracle
    ]
  }
}
