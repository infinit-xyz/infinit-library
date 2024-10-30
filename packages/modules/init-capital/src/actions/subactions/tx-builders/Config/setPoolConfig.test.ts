import { describe, expect, test } from 'vitest'

import { encodeFunctionData } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetPoolConfigTxBuilder } from '@actions/subactions/tx-builders/Config/setPoolConfig'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester
const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetPoolConfigTxBuilder', async () => {
  let txBuilder: SetPoolConfigTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test calldata', async () => {
    txBuilder = new SetPoolConfigTxBuilder(client, {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      pool: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
      poolConfig: {
        supplyCap: 12345n,
        borrowCap: 9999n,
        canMint: false,
        canBurn: false,
        canBorrow: false,
        canRepay: false,
        canFlash: false,
      },
    })
    const txData = await txBuilder.buildTx()

    const configArtifact = await readArtifact('Config')

    const mockTxData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setPoolConfig',
      args: [
        '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
        {
          supplyCap: 12345n,
          borrowCap: 9999n,
          canMint: false,
          canBurn: false,
          canBorrow: false,
          canRepay: false,
          canFlash: false,
        },
      ],
    })

    expect(mockTxData === txData.data).toBeTruthy()
    expect('0xCD399994982B3a3836B8FE81f7127cC5148e9BaE' === txData.to).toBeTruthy()
  })
})
