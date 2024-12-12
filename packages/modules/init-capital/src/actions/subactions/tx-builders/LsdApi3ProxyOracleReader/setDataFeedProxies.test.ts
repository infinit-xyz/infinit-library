import { beforeAll, describe, expect, test } from 'vitest'

import { encodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { setupInitCapital } from '@actions/__mock__/setup'

import { SetDataFeedProxiesTxBuilder } from './setDataFeedProxies'
import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

describe('SetDataFeedProxies', async () => {
  let registry: InitCapitalRegistry
  let txBuilder: SetDataFeedProxiesTxBuilder
  // anvil tester
  const account1 = privateKeyToAccount(ANVIL_PRIVATE_KEY)
  const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
  const client1 = new TestInfinitWallet(TestChain.arbitrum, account1.address)
  const client2 = new TestInfinitWallet(TestChain.arbitrum, account2.address)

  beforeAll(async () => {
    registry = await setupInitCapital()
  })

  test('test mock calldata should be matched to txBuider calldata', async () => {
    txBuilder = new SetDataFeedProxiesTxBuilder(client1, {
      lsdApi3ProxyOracleReader: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      tokens: ['0x0000000000000000000000000000000000000001'],
      dataFeedProxies: ['0x0000000000000000000000000000000000000002'],
    })
    const txData = await txBuilder.buildTx()

    const lsdApi3ProxyOracleReaderArtifact = await readArtifact('LsdApi3ProxyOracleReader')

    const mockTxData = encodeFunctionData({
      abi: lsdApi3ProxyOracleReaderArtifact.abi,
      functionName: 'setDataFeedProxies',
      args: [['0x0000000000000000000000000000000000000001'], ['0x0000000000000000000000000000000000000002']],
    })

    expect(mockTxData === txData.data).toBeTruthy()
    expect('0xCD399994982B3a3836B8FE81f7127cC5148e9BaE' === txData.to).toBeTruthy()
  })

  // TODO after deploy all base test
  test('test validate tx builder zero address should be failed.', async () => {
    txBuilder = new SetDataFeedProxiesTxBuilder(client2, {
      lsdApi3ProxyOracleReader: '0x0000000000000000000000000000000000000000',
      tokens: ['0x0000000000000000000000000000000000000001'],
      dataFeedProxies: ['0x0000000000000000000000000000000000000002'],
    })
    expect(txBuilder.validate()).rejects.toThrowError(
      'Please check your input params\nLSD_API3_PROXY_ORACLE_READER SHOULD_NOT_BE_ZERO_ADDRESS',
    )
  })
  test('test validate tx builder mismatched length should be failed.', async () => {
    txBuilder = new SetDataFeedProxiesTxBuilder(client2, {
      lsdApi3ProxyOracleReader: registry.lsdApi3ProxyOracleReaderProxy!,
      tokens: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
      dataFeedProxies: ['0x0000000000000000000000000000000000000002'],
    })
    expect(txBuilder.validate()).rejects.toThrowError('LENGTH_MISMATCH')
  })
})
