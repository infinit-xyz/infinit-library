import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleMulticallV2TxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleMulticallV2/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleMulticallV2TxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployPendleMulticallV2TxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployPendleMulticallV2TxBuilder(client)
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})
