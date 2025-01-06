import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { InitializePendleMsgSendEndpointUpgTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleMsgSendEndpointUpg/initialize'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('InitializePendleMsgSendEndpointUpgTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: InitializePendleMsgSendEndpointUpgTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new InitializePendleMsgSendEndpointUpgTxBuilder(client, {
      pendleMsgSendEndpointUpg: zeroAddress,
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).not.toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})