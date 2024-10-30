import { describe, expect, test } from 'vitest'

import { encodeFunctionData } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetLiqIncentiveCalculatorTxBuilder } from '@actions/subactions/tx-builders/InitCore/setLiqIncentiveCalculator'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester
const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetLiqIncentiveCalculatorTxBuilder', async () => {
  let txBuilder: SetLiqIncentiveCalculatorTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test calldata', async () => {
    txBuilder = new SetLiqIncentiveCalculatorTxBuilder(client, {
      initCore: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      liqIncentiveCalculator: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
    })
    const txData = await txBuilder.buildTx()

    const configArtifact = await readArtifact('InitCore')

    const mockTxData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setLiqIncentiveCalculator',
      args: ['0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93'],
    })

    expect(mockTxData === txData.data).toBeTruthy()
    expect('0xCD399994982B3a3836B8FE81f7127cC5148e9BaE' === txData.to).toBeTruthy()
  })
})
