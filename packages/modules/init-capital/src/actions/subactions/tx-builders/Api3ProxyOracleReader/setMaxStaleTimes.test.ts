import { describe, expect, test } from 'vitest'

import { encodeFunctionData } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { SetMaxStaleTimesTxBuilder } from './setMaxStaleTimes'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

describe('SetMaxStalesTimes', async () => {
  // anvil tester
  const tester = ARBITRUM_TEST_ADDRESSES.tester
  let txBuilder: SetMaxStaleTimesTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test mock calldata should be matched to txBuider calldata', async () => {
    txBuilder = new SetMaxStaleTimesTxBuilder(client, {
      api3ProxyOracleReader: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      tokens: ['0xCD399994982B3a3836B8FE81f7127cC5148e9BaE'],
      maxStaleTimes: [2n],
    })
    const txData = await txBuilder.buildTx()

    const api3ProxyOracleReaderArtifact = await readArtifact('Api3ProxyOracleReader')

    const mockTxData = encodeFunctionData({
      abi: api3ProxyOracleReaderArtifact.abi,
      functionName: 'setMaxStaleTimes',
      args: [['0xCD399994982B3a3836B8FE81f7127cC5148e9BaE'], [2n]],
    })

    expect(mockTxData === txData.data).toBeTruthy()
    expect('0xCD399994982B3a3836B8FE81f7127cC5148e9BaE' === txData.to).toBeTruthy()
  })
  // TODO after deploy all base test
  test('test validate tx builder zero address should be failed.', async () => {})
  test('test validate tx builder mismatched length should be failed.', async () => {})
})
