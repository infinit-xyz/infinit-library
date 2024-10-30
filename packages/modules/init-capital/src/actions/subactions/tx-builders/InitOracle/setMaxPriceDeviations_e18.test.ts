import { describe, expect, test } from 'vitest'

import { encodeFunctionData } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetMaxPriceDeviations_e18TxBuilder } from '@actions/subactions/tx-builders/InitOracle/setMaxPriceDeviations_e18'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester
const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetMaxPriceDeviations_e18TxBuilder', async () => {
  let txBuilder: SetMaxPriceDeviations_e18TxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test calldata', async () => {
    txBuilder = new SetMaxPriceDeviations_e18TxBuilder(client, {
      initOracle: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      tokens: ['0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93', '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5'],
      maxPriceDeviations_e18s: [BigInt(12345), BigInt(8888)],
    })
    const txData = await txBuilder.buildTx()

    const configArtifact = await readArtifact('InitOracle')

    const mockTxData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setMaxPriceDeviations_e18',
      args: [
        ['0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93', '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5'],
        [BigInt(12345), BigInt(8888)],
      ],
    })

    expect(mockTxData === txData.data).toBeTruthy()
    expect('0xCD399994982B3a3836B8FE81f7127cC5148e9BaE' === txData.to).toBeTruthy()
  })
})
