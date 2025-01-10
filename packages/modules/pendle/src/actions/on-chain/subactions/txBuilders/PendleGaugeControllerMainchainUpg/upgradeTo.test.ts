import { describe, expect, test, vi } from 'vitest'

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
      pendleGaugeControllerMainchainUpg: tester,
      newImplementation: tester,
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).not.toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate owner should be pass', async () => {
    vi.spyOn(txBuilder.client.publicClient, 'readContract').mockImplementation(async () => {
      return tester
    })
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('test validate owner should fail', async () => {
    vi.spyOn(txBuilder.client.publicClient, 'readContract').mockImplementation(async () => {
      return zeroAddress
    })
    expect(txBuilder.validate()).rejects.toThrowError('CALLER_NOT_OWNER')
  })

  test('test validate pendleGaugeControllerMainchainUpg should fail', async () => {
    vi.spyOn(txBuilder.client.publicClient, 'readContract').mockImplementation(async () => {
      return tester
    })

    txBuilder = new UpgradePendleGaugeControllerMainchainUpgTxBuilder(client, {
      pendleGaugeControllerMainchainUpg: zeroAddress,
      newImplementation: tester,
    })
    expect(txBuilder.validate()).rejects.toThrowError('PENDLE_GAUGE_CONTROLLER_MAINCHAIN_UPG')
  })
  test('test validate pendleGaugeControllerMainchainUpg should fail', async () => {
    vi.spyOn(txBuilder.client.publicClient, 'readContract').mockImplementation(async () => {
      return tester
    })

    txBuilder = new UpgradePendleGaugeControllerMainchainUpgTxBuilder(client, {
      pendleGaugeControllerMainchainUpg: tester,
      newImplementation: zeroAddress,
    })
    expect(txBuilder.validate()).rejects.toThrowError('NEW_IMPLEMENTATION')
  })
})
