import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleLimitRouterTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleLimitRouter/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleLimitRouterTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployPendleLimitRouterTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployPendleLimitRouterTxBuilder(client, { wrappedNativeToken: '0x0000000000000000000000000000000000000002' })
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate should be pass', async () => {
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('test validate should fail', async () => {
    txBuilder = new DeployPendleLimitRouterTxBuilder(client, { wrappedNativeToken: zeroAddress })

    expect(txBuilder.validate()).rejects.toThrowError('WRAPPED_NATIVE_TOKEN')
  })
})
