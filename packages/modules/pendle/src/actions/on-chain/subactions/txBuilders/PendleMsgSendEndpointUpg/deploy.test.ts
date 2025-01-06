import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleMsgSendEndpointUpgTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleMsgSendEndpointUpg/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleMsgSendEndpointUpgTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployPendleMsgSendEndpointUpgTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployPendleMsgSendEndpointUpgTxBuilder(client, {
      refundAddress: zeroAddress,
      lzEndpoint: zeroAddress,
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})
