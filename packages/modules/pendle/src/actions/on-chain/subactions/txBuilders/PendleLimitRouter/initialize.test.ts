import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { InitializePendleLimitRouterTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleLimitRouter/initialize'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('InitializePendleLimitRouterTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: InitializePendleLimitRouterTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new InitializePendleLimitRouterTxBuilder(client, {
      pendleLimitRouter: '0x0000000000000000000000000000000000000002',
      feeRecipient: '0x0000000000000000000000000000000000000003',
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).not.toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate should be pass', async () => {
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('test validate pendleLimitRouter should fail', async () => {
    txBuilder = new InitializePendleLimitRouterTxBuilder(client, {
      pendleLimitRouter: zeroAddress,
      feeRecipient: '0x0000000000000000000000000000000000000003',
    })
    expect(txBuilder.validate()).rejects.toThrowError('PENDLE_LIMIT_ROUTER')
  })

  test('test validate feeRecipient should fail', async () => {
    txBuilder = new InitializePendleLimitRouterTxBuilder(client, {
      pendleLimitRouter: '0x0000000000000000000000000000000000000003',
      feeRecipient: zeroAddress,
    })
    expect(txBuilder.validate()).rejects.toThrowError('FEE_RECIPIENT')
  })
})
