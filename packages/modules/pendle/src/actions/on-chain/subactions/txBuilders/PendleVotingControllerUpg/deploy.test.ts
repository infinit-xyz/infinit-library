import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleVotingControllerUpgTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleVotingControllerUpg/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleVotingControllerUpgTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployPendleVotingControllerUpgTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployPendleVotingControllerUpgTxBuilder(client, {
      vePendle: '0x000000000000000000000000000000000000000a',
      pendleMsgSendEndpoint: '0x0000000000000000000000000000000000000002',
      initialApproxDestinationGas: 10n,
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })
})
