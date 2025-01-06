import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployVotingEscrowPendleMainchainTxBuilder } from '@actions/on-chain/subactions/txBuilders/VotingEscrowPendleMainchain/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployVotingEscrowPendleMainchainTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployVotingEscrowPendleMainchainTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployVotingEscrowPendleMainchainTxBuilder(client, {
      pendle: zeroAddress,
      pendleMsgSendEndpoint: zeroAddress,
      initialApproxDestinationGas: 0n,
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})
