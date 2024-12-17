import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployERC1967ProxyTxBuilder, DeployERC1967ProxyTxBuilderParams } from '@actions/subactions/tx-builders/ERC1967Proxy/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployERC1967ProxyTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployERC1967ProxyTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  const params: DeployERC1967ProxyTxBuilderParams = {
    implementation: TEST_ADDRESSES.oneAddress,
  }
  txBuilder = new DeployERC1967ProxyTxBuilder(client, params)

  test('test tx correct to address and has data', async () => {
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate should be pass', async () => {
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('test validate has value and  data should be pass', async () => {
    txBuilder = new DeployERC1967ProxyTxBuilder(client, {
      implementation: TEST_ADDRESSES.oneAddress,
      data: '0x1',
      value: 1n,
    })
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('test validate zero address should be failed', async () => {
    txBuilder = new DeployERC1967ProxyTxBuilder(client, {
      implementation: zeroAddress,
    })
    expect(txBuilder.validate()).rejects.toThrowError('PENDLE_GOVERNANCE_PROXY_IMPLEMENTATION SHOULD_NOT_BE_ZERO_ADDRESS')
  })

  test('test validate has value when no data should be failed', async () => {
    txBuilder = new DeployERC1967ProxyTxBuilder(client, {
      implementation: TEST_ADDRESSES.oneAddress,
      value: 1n,
    })
    expect(txBuilder.validate()).rejects.toThrowError('If data is not provided, value should not be provided')
  })
})
