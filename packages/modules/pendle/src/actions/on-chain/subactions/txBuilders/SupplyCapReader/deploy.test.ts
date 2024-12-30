import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeploySupplyCapReaderTxBuilder } from '@actions/on-chain/subactions/txBuilders/SupplyCapReader/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeploySupplyCapReaderTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeploySupplyCapReaderTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeploySupplyCapReaderTxBuilder(client)
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})
