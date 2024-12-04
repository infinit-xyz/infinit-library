import { describe, expect, test } from 'vitest'

import { concat, pad, toFunctionSelector } from 'viem'

import { TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  InitializePendleGovernanceProxyTxBuilder,
  InitializePendleGovernanceProxyTxBuilderParams,
} from '@actions/subactions/tx-builders/PendleGovernanceProxy/initialize'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('InitializePendleGovernanceProxyTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: InitializePendleGovernanceProxyTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('tx data should be correct', async () => {
    const params: InitializePendleGovernanceProxyTxBuilderParams = {
      pendleGovernanceProxy: '0x0000000000000000000000000000000000000002',
      governance: '0x0000000000000000000000000000000000000003',
    }
    txBuilder = new InitializePendleGovernanceProxyTxBuilder(client, params)
    const bt = await txBuilder.buildTx()

    // check to address
    expect(bt.to).toBe(params.pendleGovernanceProxy)

    // check data
    const selector = toFunctionSelector('function initialize(address governance)')
    expect(bt.data).toBe(concat([selector, pad(params.governance)]))
  })
})
