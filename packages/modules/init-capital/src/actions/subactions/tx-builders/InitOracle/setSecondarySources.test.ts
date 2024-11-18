import { describe, expect, test } from 'vitest'

import { encodeFunctionData, getAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupInitCapital } from '@actions/__mock__/setup'
import { SetSecondarySourcesTxBuilder } from '@actions/subactions/tx-builders/InitOracle/setSecondarySources'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester
const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetSecondarySourcesTxBuilder', async () => {
  let txBuilder: SetSecondarySourcesTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test calldata', async () => {
    txBuilder = new SetSecondarySourcesTxBuilder(client, {
      // mock data, no need to use the real address
      initOracle: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      tokens: ['0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93', '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5'],
      sources: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
    })
    const txData = await txBuilder.buildTx()

    const configArtifact = await readArtifact('InitOracle')

    const mockTxData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setSecondarySources',
      args: [
        ['0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93', '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5'],
        ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
      ],
    })

    expect(mockTxData === txData.data).toBeTruthy()
    expect('0xCD399994982B3a3836B8FE81f7127cC5148e9BaE' === txData.to).toBeTruthy()
  })

  test('test validate mismatched length should be failed', async () => {
    txBuilder = new SetSecondarySourcesTxBuilder(client, {
      // mock data, no need to use the real address
      initOracle: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      tokens: ['0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93', '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5'],
      sources: ['0x0000000000000000000000000000000000000001'],
    })
    expect(txBuilder.validate()).rejects.toThrowError('LENGTH_MISMATCH')
  })

  test('test validate should be passed', async () => {
    const registry = await setupInitCapital()
    const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
    const client2 = new TestInfinitWallet(TestChain.arbitrum, account2.address)
    if (!registry.initOracleProxy) throw new Error('initOracleProxy is not found in registry')
    const initOracle = getAddress(registry.initOracleProxy)
    txBuilder = new SetSecondarySourcesTxBuilder(client2, {
      initOracle: initOracle,
      tokens: ['0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93', '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5'],
      sources: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
    })
    expect(txBuilder.validate()).resolves.not.toThrow()
  })
})
