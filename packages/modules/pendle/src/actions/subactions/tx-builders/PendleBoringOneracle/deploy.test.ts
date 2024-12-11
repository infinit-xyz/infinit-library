import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployPendleBoringOneracleTxBuilder } from '@actions/subactions/tx-builders/PendleBoringOneracle/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleBoringOneracleTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployPendleBoringOneracleTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployPendleBoringOneracleTxBuilder(client, {})
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})
