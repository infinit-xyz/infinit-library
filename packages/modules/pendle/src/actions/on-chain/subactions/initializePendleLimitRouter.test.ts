import { beforeAll, describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { InitializePendleLimitRouterSubaction } from '@actions/on-chain/subactions/initializePendleLimitRouter'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('InitializePendleLimitRouterSubAction', () => {
  let subAction: InitializePendleLimitRouterSubaction
  let client: TestInfinitWallet

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new InitializePendleLimitRouterSubaction(client, {
      pendleLimitRouter: '0x0000000000000000000000000000000000000002',
      feeRecipient: '0x0000000000000000000000000000000000000003',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('InitializePendleLimitRouterSubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      pendleLimitRouter: '0x0000000000000000000000000000000000000002',
      feeRecipient: '0x0000000000000000000000000000000000000003',
    })
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })
})
