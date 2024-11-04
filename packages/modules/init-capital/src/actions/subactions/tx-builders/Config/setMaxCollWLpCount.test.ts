import { describe, expect, test } from 'vitest'

import { encodeFunctionData } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetMaxCollWLpCountTxBuilder } from '@actions/subactions/tx-builders/Config/setMaxCollWLpCount'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester
const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetMaxCollWLpCountTxBuilder', async () => {
  let txBuilder: SetMaxCollWLpCountTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test calldata', async () => {
    txBuilder = new SetMaxCollWLpCountTxBuilder(client, {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      mode: 1,
      maxCollWLpCount: 5,
    })
    const txData = await txBuilder.buildTx()

    const configArtifact = await readArtifact('Config')

    const mockTxData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setMaxCollWLpCount',
      args: [1, 5],
    })

    expect(mockTxData === txData.data).toBeTruthy()
    expect('0xCD399994982B3a3836B8FE81f7127cC5148e9BaE' === txData.to).toBeTruthy()
  })

  // TODO: test validate after has base init test setup
  test('test validate', async () => {})
})
