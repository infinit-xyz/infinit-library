import { describe, expect, test } from 'vitest'

import { encodeFunctionData } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { SetModeStatusTxBuilder } from './setModeStatus'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester
const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetModeStatus', async () => {
  let txBuilder: SetModeStatusTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test calldata', async () => {
    txBuilder = new SetModeStatusTxBuilder(client, {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      mode: 1,
      status: {
        canCollateralize: true,
        canDecollateralize: false,
        canBorrow: true,
        canRepay: false,
      },
    })
    const txData = await txBuilder.buildTx()

    const configArtifact = await readArtifact('Config')

    const mockTxData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setModeStatus',
      args: [
        1,
        {
          canCollateralize: true,
          canDecollateralize: false,
          canBorrow: true,
          canRepay: false,
        },
      ],
    })

    expect(mockTxData === txData.data).toBeTruthy()
    expect('0xCD399994982B3a3836B8FE81f7127cC5148e9BaE' === txData.to).toBeTruthy()
  })
})
