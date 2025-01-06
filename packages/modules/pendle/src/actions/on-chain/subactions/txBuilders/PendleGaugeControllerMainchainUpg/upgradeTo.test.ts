import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { UpgradePendleGaugeControllerMainchainUpgTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleGaugeControllerMainchainUpg/upgradeTo'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('UpgradePendleGaugeControllerMainchainUpgTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: UpgradePendleGaugeControllerMainchainUpgTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new UpgradePendleGaugeControllerMainchainUpgTxBuilder(client, {
      pendleGaugeControllerMainchainUpg: zeroAddress,
      newImplementation: zeroAddress,
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).not.toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})
