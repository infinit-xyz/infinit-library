import { beforeAll, describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'
import { Account, privateKeyToAccount } from 'viem/accounts'

import { PendleV3Registry } from '../type'
import { ANVIL_PRIVATE_KEY } from './__mocks__/account'
import { DeployPendleV3Action } from './deployPendleV3'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('deployPendleV3Action', () => {
  let client: TestInfinitWallet
  let account: Account
  const bnAddress = '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8'

  beforeAll(() => {
    account = privateKeyToAccount(ANVIL_PRIVATE_KEY)
    client = new TestInfinitWallet(TestChain.arbitrum, account.address)
  })

  test('deployPendleV3Action', async () => {
    const action = new DeployPendleV3Action({
      params: {
        refundAddress: bnAddress,
        lzEndpoint: bnAddress,
        governanceToken: bnAddress,
        initialApproxDestinationGas: 100000n,
        // using the parameters for the contractFactory referenced from https://basescan.org/tx/0x06d6e63b9e08be0e504375787193e674678d553c7a83546f8ee63d824c31f88a
        wrappedNativetoken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        feeRecipient: '0x0000000000000000000000000000000000000001',
        treasury: bnAddress,
        yieldContractFactory: {
          expiryDivisor: 86400n,
          interestFeeRate: 30000000000000000n,
          rewardFeeRate: 30000000000000000n,
        },
        rewardToken: bnAddress,
        marketContractFactory: {
          reserveFeePercent: 10,
          guaugeController: bnAddress,
        },
        blockCycleNumerator: 1000,
      },
      signer: {
        deployer: client,
      },
    })
    let registry = {}
    registry = await action.run(registry)
    checkRegistry(registry)
  })
})

const checkRegistry = async (registry: PendleV3Registry) => {
  expect(registry.baseSplitCodeFactoryContract).not.toBe(zeroAddress)
  expect(registry.oracleLib).not.toBe(zeroAddress)
  expect(registry.pendleGaugeControllerMainchainUpg).not.toBe(zeroAddress)
  expect(registry.pendleMarketFactoryV3).not.toBe(zeroAddress)
  expect(registry.pendlePYLpOracle).not.toBe(zeroAddress)
  expect(registry.pendleSwap).not.toBe(zeroAddress)
  expect(registry.pendleYieldContractFactory).not.toBe(zeroAddress)
  expect(registry.votingEscrowPendleMainchain).not.toBe(zeroAddress)
  expect(registry.pendleMsgSendEndpointUpgImpl).not.toBe(zeroAddress)
  expect(registry.pendleMsgSendEndpointUpgProxy).not.toBe(zeroAddress)
  expect(registry.pendleVotingContollerUpgImpl).not.toBe(zeroAddress)
  expect(registry.pendleVotingControllerUpgProxy).not.toBe(zeroAddress)
  expect(registry.pendleGaugeControllerMainchainUpg).not.toBe(zeroAddress)

  // check pendleRouterV4 facets
  expect(registry.routerStorageV4).not.toBe(zeroAddress)
  expect(registry.actionAddRemoveLiqV3).not.toBe(zeroAddress)
  expect(registry.actionCallbackV3).not.toBe(zeroAddress)
  expect(registry.actionMiscV3).not.toBe(zeroAddress)
  expect(registry.actionSimple).not.toBe(zeroAddress)
  expect(registry.actionSwapPTV3).not.toBe(zeroAddress)
  expect(registry.actionSwapYTV3).not.toBe(zeroAddress)

  expect(registry.pendleRouterV4).not.toBe(zeroAddress)

  // check pendleRouterStatic facets
  expect(registry.pendleRouterStatic).not.toBe(zeroAddress)
  expect(registry.actionStorageStatic).not.toBe(zeroAddress)
  expect(registry.actionInfoStatic).not.toBe(zeroAddress)
  expect(registry.actionMarketAuxStatic).not.toBe(zeroAddress)
  expect(registry.actionMarketCoreStatic).not.toBe(zeroAddress)
  expect(registry.actionMintRedeemStatic).not.toBe(zeroAddress)
  expect(registry.actionVePendleStatic).not.toBe(zeroAddress)

  expect(registry.proxyAdmin).not.toBe(zeroAddress)
  expect(registry.pendleLimitRouterImpl).not.toBe(zeroAddress)
  expect(registry.pendleLimitRouterProxy).not.toBe(zeroAddress)
  expect(registry.pendlePYLpOracle).not.toBe(zeroAddress)
  expect(registry.pendlePYLpOracleProxy).not.toBe(zeroAddress)

  // check off-chain
  expect(registry.pendleMulticallV2).not.toBe(zeroAddress)
  expect(registry.multicall).not.toBe(zeroAddress)
  expect(registry.simulateHelper).not.toBe(zeroAddress)
  expect(registry.supplyCapReader).not.toBe(zeroAddress)

  expect(registry.pendlePoolDeployHelper).not.toBe(zeroAddress)
}
