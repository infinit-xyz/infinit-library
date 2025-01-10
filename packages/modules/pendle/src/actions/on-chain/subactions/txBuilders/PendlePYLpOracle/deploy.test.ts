import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendlePYLpOracleTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendlePYLpOracle/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendlePYLpOracleTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployPendlePYLpOracleTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployPendlePYLpOracleTxBuilder(client)
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})
