import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployProxyAdminTxBuilder } from '@actions/on-chain/subactions/txBuilders/ProxyAdmin/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployProxyAdminTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployProxyAdminTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployProxyAdminTxBuilder(client)
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate should be pass', async () => {
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })
})
