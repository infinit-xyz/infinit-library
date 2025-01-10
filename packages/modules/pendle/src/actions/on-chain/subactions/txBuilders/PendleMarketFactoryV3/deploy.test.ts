import { describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleMarketFactoryV3TxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleMarketFactoryV3/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleMarketFactoryV3TxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployPendleMarketFactoryV3TxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployPendleMarketFactoryV3TxBuilder(client, {
      yieldContractFactory: zeroAddress,
      marketCreationCodeContractA: zeroAddress,
      marketCreationCodeSizeA: 1n,
      marketCreationCodeContractB: zeroAddress,
      marketCreationCodeSizeB: 1n,
      treasury: '0x0000000000000000000000000000000000000003',
      reserveFeePercent: 1,
      vePendle: zeroAddress,
      guaugeController: zeroAddress,
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate should be pass', async () => {
    vi.spyOn(txBuilder.client.publicClient, 'getCode').mockImplementation(async () => {
      return '0x0000000000000000000000000000000000000002'
    })
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('test validate treasury should fail', async () => {
    txBuilder = new DeployPendleMarketFactoryV3TxBuilder(client, {
      yieldContractFactory: zeroAddress,
      marketCreationCodeContractA: zeroAddress,
      marketCreationCodeSizeA: 1n,
      marketCreationCodeContractB: zeroAddress,
      marketCreationCodeSizeB: 1n,
      treasury: zeroAddress,
      reserveFeePercent: 1,
      vePendle: zeroAddress,
      guaugeController: zeroAddress,
    })
    vi.spyOn(txBuilder.client.publicClient, 'getCode').mockImplementation(async () => {
      return '0x0000000000000000000000000000000000000002'
    })
    expect(txBuilder.validate()).rejects.toThrowError('TREASURY')
  })
})
