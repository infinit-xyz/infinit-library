import { beforeAll, describe, expect, test, vi } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'

import { InitializePendleYieldContractFactorySubaction } from './initializePendleYieldContractFactory'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('InitializePendleVotingControllerUpgSubaction', () => {
  let subAction: InitializePendleYieldContractFactorySubaction
  let client: TestInfinitWallet

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new InitializePendleYieldContractFactorySubaction(client, {
      pendleYieldContractFactory: '0x0000000000000000000000000000000000000002',
      expiryDivisor: 100n,
      interestFeeRate: 10000n,
      rewardFeeRate: 11000n,
      treasury: '0x0000000000000000000000000000000000000006',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('InitializePendleYieldContractFactorySubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      pendleYieldContractFactory: '0x0000000000000000000000000000000000000002',
      expiryDivisor: 100n,
      interestFeeRate: 10000n,
      rewardFeeRate: 11000n,
      treasury: '0x0000000000000000000000000000000000000006',
    })
  })

  test('validate should be success', async () => {
    // spy on validate
    vi.spyOn(subAction.txBuilders[0], 'validate').mockImplementation(async () => {})
    await expect(subAction.validate()).resolves.not.toThrowError()
  })
})
