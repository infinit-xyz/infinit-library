import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { InitializePendleGaugeControllerMainchainUpgTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleGaugeControllerMainchainUpg/initialize'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('InitializePendleGaugeControllerMainchainUpgTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: InitializePendleGaugeControllerMainchainUpgTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new InitializePendleGaugeControllerMainchainUpgTxBuilder(client, {
      pendleGaugeControllerMainchainUpg: '0x0000000000000000000000000000000000000002',
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).not.toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate should be pass', async () => {
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('test validate pendleGaugeControllerMainchainUpg should fail', async () => {
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })
})
