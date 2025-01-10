import { beforeAll, describe, expect, test, vi } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { InitializePendleVotingControllerUpgSubaction } from '@actions/on-chain/subactions/initializePendleVotingControllerUpg'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('InitializePendleVotingControllerUpgSubaction', () => {
  let subAction: InitializePendleVotingControllerUpgSubaction
  let client: TestInfinitWallet

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new InitializePendleVotingControllerUpgSubaction(client, {
      pendleVotingControllerUpg: '0x0000000000000000000000000000000000000002',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('InitializePendleVotingControllerUpgSubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      pendleVotingControllerUpg: '0x0000000000000000000000000000000000000002',
    })
  })

  test('validate should be success', async () => {
    // spy on validate
    vi.spyOn(subAction.txBuilders[0], 'validate').mockImplementation(async () => {})
    await expect(subAction.validate()).resolves.not.toThrowError()
  })
})
