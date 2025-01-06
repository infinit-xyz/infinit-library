import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleYieldContractFactoryTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleYieldContractFactory/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleYieldContractFactoryTxBuilderParams', () => {
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
})
