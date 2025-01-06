import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleGaugeControllerMainchainUpgTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleGaugeControllerMainchainUpg/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleGaugeControllerMainchainUpgTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployPendleGaugeControllerMainchainUpgTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployPendleGaugeControllerMainchainUpgTxBuilder(client, {
      votingController: '0x0000000000000000000000000000000000000002',
      pendle: '0x0000000000000000000000000000000000000003',
      marketFactory: '0x0000000000000000000000000000000000000004',
      marketFactory2: '0x0000000000000000000000000000000000000005',
      marketFactory3: '0x0000000000000000000000000000000000000006',
      marketFactory4: '0x0000000000000000000000000000000000000007',
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})
