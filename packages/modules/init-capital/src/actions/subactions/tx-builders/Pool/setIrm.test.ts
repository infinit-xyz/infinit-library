import { describe, expect, test } from 'vitest'

import { encodeFunctionData } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetIrmTxBuilder } from '@actions/subactions/tx-builders/Pool/setIrm'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester
const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetIrmTxBuilder', async () => {
  let txBuilder: SetIrmTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test calldata', async () => {
    txBuilder = new SetIrmTxBuilder(client, {
      pool: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
      irm: '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf',
    })
    const txData = await txBuilder.buildTx()

    const configArtifact = await readArtifact('LendingPool')

    const mockTxData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setIrm',
      args: ['0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf'],
    })

    expect(mockTxData === txData.data).toBeTruthy()
    expect('0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93' === txData.to).toBeTruthy()
  })
})
