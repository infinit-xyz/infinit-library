import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleRouterStaticTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleRouterStatic/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleRouterStaticTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployPendleRouterStaticTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployPendleRouterStaticTxBuilder(client, {
      storageLayout: '0x0000000000000000000000000000000000000002',
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate should be pass', async () => {
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('test validate storageLayout should fail', async () => {
    txBuilder = new DeployPendleRouterStaticTxBuilder(client, {
      storageLayout: zeroAddress,
    })
    expect(txBuilder.validate()).rejects.toThrowError('STORAGE_LAYOUT')
  })
})
