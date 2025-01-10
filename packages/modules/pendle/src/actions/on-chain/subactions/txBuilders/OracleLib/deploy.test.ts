import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployOracleLibTxBuilder } from '@actions/on-chain/subactions/txBuilders/OracleLib/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployOracleLibTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployOracleLibTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployOracleLibTxBuilder(client)
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})
