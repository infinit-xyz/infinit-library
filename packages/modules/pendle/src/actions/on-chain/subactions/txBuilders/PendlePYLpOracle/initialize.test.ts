import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { InitializePendlePYLpOracleTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendlePYLpOracle/initialize'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('InitializePendlePYLpOracleTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: InitializePendlePYLpOracleTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new InitializePendlePYLpOracleTxBuilder(client, {
      pendlePYLpOracle: '0x0000000000000000000000000000000000000002',
      blockCycleNumerator: 1,
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).not.toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test tx validate blockCycleNumerator >= 1000 should be pass', async () => {
    txBuilder = new InitializePendlePYLpOracleTxBuilder(client, {
      pendlePYLpOracle: '0x0000000000000000000000000000000000000002',
      blockCycleNumerator: 1000,
    })
    expect(txBuilder.validate()).resolves.toBeUndefined()
  })

  test('test tx validate blockCycleNumerator < 1000 should be reject', async () => {
    txBuilder = new InitializePendlePYLpOracleTxBuilder(client, {
      pendlePYLpOracle: '0x0000000000000000000000000000000000000002',
      blockCycleNumerator: 999,
    })
    expect(txBuilder.validate()).rejects.toThrowError('BlockCycleNumerator must be greater than 1000')
  })
})
