import { describe, expect, test } from 'vitest'

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
      treasury: zeroAddress,
      reserveFeePercent: 1,
      vePendle: zeroAddress,
      guaugeController: zeroAddress,
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})
