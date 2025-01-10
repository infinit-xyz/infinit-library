import { describe, expect, test, vi } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleYieldContractFactoryTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleYieldContractFactory/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleYieldContractFactoryTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployPendleYieldContractFactoryTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployPendleYieldContractFactoryTxBuilder(client, {
      ytCreationCodeContractA: '0x0000000000000000000000000000000000000002',
      ytCreationCodeSizeA: 100n,
      ytCreationCodeContractB: '0x0000000000000000000000000000000000000003',
      ytCreationCodeSizeB: 200n,
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate should be pass', async () => {
    expect(txBuilder.validate()).rejects.toThrowError('ContractA is not deployed')
  })
  test('test validate should be pass', async () => {
    vi.spyOn(txBuilder.client.publicClient, 'getCode').mockImplementation(async () => '0x0000000000000000000000000000000000000003')
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })
})
