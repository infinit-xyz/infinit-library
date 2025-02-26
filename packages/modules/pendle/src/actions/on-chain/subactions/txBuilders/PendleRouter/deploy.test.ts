import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleRouterV4TxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleRouter/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleRouterV4TxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployPendleRouterV4TxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployPendleRouterV4TxBuilder(client, {
      owner: '0x0000000000000000000000000000000000000B0b',
      actionStorage: '0x0000000000000000000000000000000000000002',
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate should be pass', async () => {
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('test validate owner should fail', async () => {
    txBuilder = new DeployPendleRouterV4TxBuilder(client, {
      owner: zeroAddress,
      actionStorage: '0x0000000000000000000000000000000000000002',
    })
    expect(txBuilder.validate()).rejects.toThrowError('OWNER')
  })

  test('test validate actionStorage should fail', async () => {
    txBuilder = new DeployPendleRouterV4TxBuilder(client, {
      owner: '0x0000000000000000000000000000000000000002',
      actionStorage: zeroAddress,
    })
    expect(txBuilder.validate()).rejects.toThrowError('ACTION_STORAGE')
  })
})
