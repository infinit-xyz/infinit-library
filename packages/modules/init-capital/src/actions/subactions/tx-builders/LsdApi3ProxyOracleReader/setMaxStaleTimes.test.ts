import { beforeAll, describe, expect, test } from 'vitest'

import { encodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { setupInitCapital } from '@actions/__mock__/setup'

import { SetMaxStaleTimesTxBuilder } from './setMaxStaleTimes'
import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

describe('SetMaxStalesTimes', async () => {
  let txBuilder: SetMaxStaleTimesTxBuilder
  // anvil tester
  const account1 = privateKeyToAccount(ANVIL_PRIVATE_KEY)
  const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
  const client1 = new TestInfinitWallet(TestChain.arbitrum, account1.address)
  const client2 = new TestInfinitWallet(TestChain.arbitrum, account2.address)
  let registry: InitCapitalRegistry

  beforeAll(async () => {
    registry = await setupInitCapital()
  })

  test('test mock calldata should be matched to txBuider calldata', async () => {
    txBuilder = new SetMaxStaleTimesTxBuilder(client1, {
      lsdApi3ProxyOracleReader: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      tokens: ['0xCD399994982B3a3836B8FE81f7127cC5148e9BaE'],
      maxStaleTimes: [2n],
    })
    const txData = await txBuilder.buildTx()

    const api3ProxyOracleReaderArtifact = await readArtifact('LsdApi3ProxyOracleReader')

    const mockTxData = encodeFunctionData({
      abi: api3ProxyOracleReaderArtifact.abi,
      functionName: 'setMaxStaleTimes',
      args: [['0xCD399994982B3a3836B8FE81f7127cC5148e9BaE'], [2n]],
    })

    expect(mockTxData === txData.data).toBeTruthy()
    expect('0xCD399994982B3a3836B8FE81f7127cC5148e9BaE' === txData.to).toBeTruthy()
  })

  test('test validate tx builder zero address should be failed.', async () => {
    txBuilder = new SetMaxStaleTimesTxBuilder(client2, {
      lsdApi3ProxyOracleReader: '0x0000000000000000000000000000000000000000',
      tokens: ['0xCD399994982B3a3836B8FE81f7127cC5148e9BaE'],
      maxStaleTimes: [2n],
    })
    expect(txBuilder.validate()).rejects.toThrowError('Please check your input params\nAPI3_PROXY_ORACLE_READER SHOULD_NOT_BE_ZERO_ADDRESS')
  })

  test('test validate tx builder mismatched length should be failed.', async () => {
    txBuilder = new SetMaxStaleTimesTxBuilder(client2, {
      lsdApi3ProxyOracleReader: registry.api3ProxyOracleReaderProxy!,
      tokens: ['0xCD399994982B3a3836B8FE81f7127cC5148e9BaE'],
      maxStaleTimes: [2n, 3n],
    })
    expect(txBuilder.validate()).rejects.toThrowError('LENGTH_MISMATCH')
  })
})
