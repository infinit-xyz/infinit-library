import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeploySimulateHelperTxBuilder } from '@actions/subactions/tx-builders/SimulateHelper/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeploySimulateHelperTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeploySimulateHelperTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeploySimulateHelperTxBuilder(client)
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})
