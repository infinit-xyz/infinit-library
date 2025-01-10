import { beforeAll, describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'

import { InitializePendleMsgSendEndpointUpgSubaction } from './initializePendleMsgSendEndpointUpg'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('InitializePendleMsgSendEndpointUpgSubaction', () => {
  let subAction: InitializePendleMsgSendEndpointUpgSubaction
  let client: TestInfinitWallet

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new InitializePendleMsgSendEndpointUpgSubaction(client, {
      pendleMsgSendEndpointUpg: '0x0000000000000000000000000000000000000002',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('InitializePendleMsgSendEndpointUpgSubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      pendleMsgSendEndpointUpg: '0x0000000000000000000000000000000000000002',
    })
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })
})
