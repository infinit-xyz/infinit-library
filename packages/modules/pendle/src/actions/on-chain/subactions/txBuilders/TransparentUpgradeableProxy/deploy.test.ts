import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployTransparentUpgradeableProxyTxBuilder } from '@actions/on-chain/subactions/txBuilders/TransparentUpgradeableProxy/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployTransparentUpgradeableProxyTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployTransparentUpgradeableProxyTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployTransparentUpgradeableProxyTxBuilder(client, {
      logic: '0x0000000000000000000000000000000000000002',
      admin: '0x0000000000000000000000000000000000000003',
      data: '0x',
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate should be pass', async () => {
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('test logic validate should fail', async () => {
    txBuilder = new DeployTransparentUpgradeableProxyTxBuilder(client, {
      logic: zeroAddress,
      admin: '0x0000000000000000000000000000000000000003',
      data: '0x',
    })
    expect(txBuilder.validate()).rejects.toThrowError('LOGIC')
  })

  test('test admin validate should fail', async () => {
    txBuilder = new DeployTransparentUpgradeableProxyTxBuilder(client, {
      logic: '0x0000000000000000000000000000000000000003',
      admin: zeroAddress,
      data: '0x',
    })
    expect(txBuilder.validate()).rejects.toThrowError('ADMIN')
  })
})
