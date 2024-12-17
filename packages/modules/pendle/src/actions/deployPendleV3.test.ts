import { beforeAll, describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'
import { Account, privateKeyToAccount } from 'viem/accounts'

import { PendleV3Registry } from '../type'
import { ANVIL_PRIVATE_KEY } from './__mock__/account'
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
        treasury: bnAddress,
        yieldContractFactory: {
          expiryDivisor: 86400n,
          interestFeeRate: 30000000000000000n,
          rewardFeeRate: 30000000000000000n,
        },
        marketContractFactory: {
          reserveFeePercent: 10,
          vePendle: bnAddress,
          guaugeController: bnAddress,
        },
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

const checkRegistry = (registry: PendleV3Registry) => {
  expect(registry.baseSplitCodeFactoryContract).not.toBe(zeroAddress)
  expect(registry.pendleSwap).not.toBe(zeroAddress)
  expect(registry.pendleMsgSendEndpointUpgImpl).not.toBe(zeroAddress)
  expect(registry.pendleMsgSendEndpointUpgProxy).not.toBe(zeroAddress)
  expect(registry.votingEscrowPendleMainchain).not.toBe(zeroAddress)
  expect(registry.pendleYieldContractFactory).not.toBe(zeroAddress)
  expect(registry.oracleLib).not.toBe(zeroAddress)
}
