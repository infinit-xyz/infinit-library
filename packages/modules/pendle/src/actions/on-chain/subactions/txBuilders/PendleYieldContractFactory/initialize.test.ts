import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { InitializePendleYieldContractFactoryTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleYieldContractFactory/initialize'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('InitializePendleYieldContractFactoryTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: InitializePendleYieldContractFactoryTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new InitializePendleYieldContractFactoryTxBuilder(client, {
      pendleYieldContractFactory: '0x0000000000000000000000000000000000000002',
      expiryDivisor: 100n,
      interestFeeRate: 200n,
      rewardFeeRate: 300n,
      treasury: '0x0000000000000000000000000000000000000003',
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).not.toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate expiryDivisor <= 0', async () => {
    txBuilder = new InitializePendleYieldContractFactoryTxBuilder(client, {
      pendleYieldContractFactory: '0x0000000000000000000000000000000000000002',
      expiryDivisor: -10n,
      interestFeeRate: 200n,
      rewardFeeRate: 300n,
      treasury: '0x0000000000000000000000000000000000000003',
    })
    expect(txBuilder.validate()).rejects.toThrowError('Please check your input params\nExpiryDivisor must be greater than 0')
  })
})