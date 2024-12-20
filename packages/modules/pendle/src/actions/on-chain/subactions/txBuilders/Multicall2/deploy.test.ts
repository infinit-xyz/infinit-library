import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployMulticall2TxBuilder } from '@actions/on-chain/subactions/txBuilders/Multicall2/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployMulticall2TxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployMulticall2TxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployMulticall2TxBuilder(client)
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})
