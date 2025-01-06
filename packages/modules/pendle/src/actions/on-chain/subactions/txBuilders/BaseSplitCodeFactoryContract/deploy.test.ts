import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployBaseSplitCodeFactoryContractTxBuilder } from '@actions/on-chain/subactions/txBuilders/BaseSplitCodeFactoryContract/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployBaseSplitCodeFactoryContractTxBuilder', () => {
  const tester = ARBITRUM_TEST_ADDRESSES.tester
  let txBuilder: DeployBaseSplitCodeFactoryContractTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  txBuilder = new DeployBaseSplitCodeFactoryContractTxBuilder(client)

  test('test tx correct to address and has data', async () => {
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate should be pass', async () => {
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('test validate has value and  data should be pass', async () => {
    txBuilder = new DeployBaseSplitCodeFactoryContractTxBuilder(client)
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })
})
