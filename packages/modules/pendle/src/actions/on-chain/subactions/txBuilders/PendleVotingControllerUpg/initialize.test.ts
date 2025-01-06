import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { InitializePendleVotingControllerUpgTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleVotingControllerUpg/initialize'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('InitializePendleVotingControllerUpgTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: InitializePendleVotingControllerUpgTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new InitializePendleVotingControllerUpgTxBuilder(client, {
      pendleVotingControllerUpg: '0x0000000000000000000000000000000000000002',
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).not.toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})
