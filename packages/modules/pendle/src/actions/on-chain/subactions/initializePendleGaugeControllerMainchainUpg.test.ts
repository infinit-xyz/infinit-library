import { beforeAll, describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  InitializePendleGaugeControllerMainchainUpgSubActionParams,
  InitializePendleGaugeControllerMainchainUpgSubaction,
} from '@actions/on-chain/subactions/initializePendleGaugeControllerMainchainUpg'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('InitializePendleGaugeControllerMainchainUpgSubaction', () => {
  let subAction: InitializePendleGaugeControllerMainchainUpgSubaction
  let client: TestInfinitWallet
  const tester = ARBITRUM_TEST_ADDRESSES.tester

  // TODO: use deployed contract address for implementation
  // note: use any implementation address that is a contract to avoid revert
  const params: InitializePendleGaugeControllerMainchainUpgSubActionParams = {
    pendleGaugeControllerMainchainUpg: '0x0000000000000000000000000000000000000002',
  }

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new InitializePendleGaugeControllerMainchainUpgSubaction(client, params)
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('InitializePendleGaugeControllerMainchainUpgSubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual(params)
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  // TODO: test validate values after execute on the deployed contract
})
