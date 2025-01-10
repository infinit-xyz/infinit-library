import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { TransferOwnershipPendleGaugeControllerMainchainUpgTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleGaugeControllerMainchainUpg/transferOwnership'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('TransferOwnershipPendleGaugeControllerMainchainUpgTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: TransferOwnershipPendleGaugeControllerMainchainUpgTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new TransferOwnershipPendleGaugeControllerMainchainUpgTxBuilder(client, {
      pendleGaugeControllerMainchainUpg: '0x0000000000000000000000000000000000000002',
      newOwner: '0x0000000000000000000000000000000000000003',
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).not.toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate should be pass', async () => {
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('test validate newOwner should fail', async () => {
    txBuilder = new TransferOwnershipPendleGaugeControllerMainchainUpgTxBuilder(client, {
      pendleGaugeControllerMainchainUpg: '0x0000000000000000000000000000000000000002',
      newOwner: zeroAddress,
    })
    expect(txBuilder.validate()).rejects.toThrowError('NEW_OWNER')
  })

  test('test validate pendleGaugeControllerMainchainUpg should fail', async () => {
    txBuilder = new TransferOwnershipPendleGaugeControllerMainchainUpgTxBuilder(client, {
      pendleGaugeControllerMainchainUpg: zeroAddress,
      newOwner: '0x0000000000000000000000000000000000000002',
    })
    expect(txBuilder.validate()).rejects.toThrowError('PENDLE_GAUGE_CONTROLLER_MAINCHAIN_UPG')
  })
})
