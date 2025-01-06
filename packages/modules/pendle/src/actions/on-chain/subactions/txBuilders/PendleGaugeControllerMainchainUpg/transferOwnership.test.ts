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
      pendleGaugeControllerMainchainUpg: zeroAddress,
      newOwner: zeroAddress,
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})
