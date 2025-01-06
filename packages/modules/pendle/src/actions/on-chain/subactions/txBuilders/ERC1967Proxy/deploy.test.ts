import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployERC1967ProxyTxBuilder, DeployERC1967ProxyTxBuilderParams } from '@actions/on-chain/subactions/txBuilders/ERC1967Proxy/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployERC1967ProxyTxBuilder', () => {
  const tester = ARBITRUM_TEST_ADDRESSES.tester
  let txBuilder: DeployERC1967ProxyTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  const params: DeployERC1967ProxyTxBuilderParams = {
    implementation: ARBITRUM_TEST_ADDRESSES.weth,
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
      implementation: ARBITRUM_TEST_ADDRESSES.weth,
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

  test('test validate no bytecode implementtation should be failed', async () => {
    txBuilder = new DeployERC1967ProxyTxBuilder(client, {
      implementation: ARBITRUM_TEST_ADDRESSES.oneAddress,
    })
    expect(txBuilder.validate()).rejects.toThrowError('Implementation should have bytecode')
  })
})
