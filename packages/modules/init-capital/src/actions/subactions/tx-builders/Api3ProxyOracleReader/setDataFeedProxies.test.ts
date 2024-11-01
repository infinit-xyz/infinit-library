import { describe, expect, test } from 'vitest'

import { encodeFunctionData } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { SetDataFeedProxiesTxBuilder } from './setDataFeedProxies'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

describe('SetDataFeedProxies', async () => {
  // anvil tester
  const tester = ARBITRUM_TEST_ADDRESSES.tester

  let txBuilder: SetDataFeedProxiesTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test mock calldata should be matched to txBuider calldata', async () => {
    txBuilder = new SetDataFeedProxiesTxBuilder(client, {
      api3ProxyOracleReader: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      tokens: ['0x0000000000000000000000000000000000000001'],
      dataFeedProxies: ['0x0000000000000000000000000000000000000002'],
    })
    const txData = await txBuilder.buildTx()

    const api3ProxyOracleReaderArtifact = await readArtifact('Api3ProxyOracleReader')

    const mockTxData = encodeFunctionData({
      abi: api3ProxyOracleReaderArtifact.abi,
      functionName: 'setDataFeedProxies',
      args: [['0x0000000000000000000000000000000000000001'], ['0x0000000000000000000000000000000000000002']],
    })

    expect(mockTxData === txData.data).toBeTruthy()
    expect('0xCD399994982B3a3836B8FE81f7127cC5148e9BaE' === txData.to).toBeTruthy()
  })

  // TODO after deploy all base test
  test('test validate tx builder zero address should be failed.', async () => {})
  // TODO after deploy all base test
  test('test validate tx builder mismatched lenght should be failed.', async () => {})
})
