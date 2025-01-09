import { beforeAll, describe, expect, test, vi } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { InitializePendlePYLpOracleSubaction } from '@actions/on-chain/subactions/initializePendlePYLpOracle'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('InitializePendlePYLpOracleSubaction', () => {
  let subAction: InitializePendlePYLpOracleSubaction
  let client: TestInfinitWallet

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new InitializePendlePYLpOracleSubaction(client, {
      pendlePYLpOracle: '0x0000000000000000000000000000000000000002',
      blockCycleNumerator: 100,
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('InitializePendlePYLpOracleSubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      pendlePYLpOracle: '0x0000000000000000000000000000000000000002',
      blockCycleNumerator: 100,
    })
  })

  test('validate should be success', async () => {
    // spy on validate
    vi.spyOn(subAction.txBuilders[0], 'validate').mockImplementation(async () => {})
    await expect(subAction.validate()).resolves.not.toThrowError()
  })
})
