import { beforeAll, describe, expect, test, vi } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'

import { TransferOwnershipPendleGaugeControllerMainchainUpgSubAction } from './transferOwnershipPendleGaugeControllerMainchainUpg'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('TransferOwnershipPendleGaugeControllerMainchainUpgSubAction', () => {
  let subAction: TransferOwnershipPendleGaugeControllerMainchainUpgSubAction
  let client: TestInfinitWallet

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new TransferOwnershipPendleGaugeControllerMainchainUpgSubAction(client, {
      pendleGaugeControllerMainchainUpg: '0x0000000000000000000000000000000000000002',
      newOwner: '0x0000000000000000000000000000000000000003',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('TransferOwnershipPendleGaugeControllerMainchainUpgSubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      pendleGaugeControllerMainchainUpg: '0x0000000000000000000000000000000000000002',
      newOwner: '0x0000000000000000000000000000000000000003',
    })
  })

  test('validate should be success', async () => {
    // spy on validate
    vi.spyOn(subAction.txBuilders[0], 'validate').mockImplementation(async () => {})
    await expect(subAction.validate()).resolves.not.toThrowError()
  })
})