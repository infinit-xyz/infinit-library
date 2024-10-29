import { describe, expect, test } from 'vitest'

import { encodeFunctionData, maxUint256 } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { SetBorrFactorE18TxBuilder } from './setBorrFactors_e18'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester
const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetBorrFactorsE18', async () => {
  let txBuilder: SetBorrFactorE18TxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test("test tx builder's calldata should be matched with mock data", async () => {
    txBuilder = new SetBorrFactorE18TxBuilder(client, {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      mode: 1,
      pools: ['0x0000000000000000000000000000000000000001'],
      factors_e18: [1n],
    })
    const txData = await txBuilder.buildTx()

    const configArtifact = await readArtifact('Config')

    const mockTxData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setBorrFactors_e18',
      args: [1, ['0x0000000000000000000000000000000000000001'], [1n]],
    })
    expect(mockTxData === txData.data).toBeTruthy()
    expect('0xCD399994982B3a3836B8FE81f7127cC5148e9BaE' === txData.to).toBeTruthy()
  })

  test('test pool zero address should throw error on validation', async () => {
    txBuilder = new SetBorrFactorE18TxBuilder(client, {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      mode: 1,
      pools: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000'],
      factors_e18: [1n, 1n],
    })
    expect(txBuilder.validate()).rejects.toThrowError('POOL (INDEX:1) SHOULD_NOT_BE_ZERO_ADDRESS')
  })

  test('test negative factor should thorw error on validation', async () => {
    txBuilder = new SetBorrFactorE18TxBuilder(client, {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      mode: 2,
      pools: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
      factors_e18: [-1n, 1n],
    })
    expect(txBuilder.validate()).rejects.toThrowError(
      'Borrow factor (index: 0) is out of range (min: 0n, max: 340282366920938463463374607431768211455), got -1',
    )
  })

  test('test too large factor should throw error on validation', async () => {
    txBuilder = new SetBorrFactorE18TxBuilder(client, {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      mode: 2,
      pools: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
      factors_e18: [1n, maxUint256],
    })
    expect(txBuilder.validate()).rejects.toThrowError(
      `Borrow factor (index: 1) is out of range (min: 0n, max: 340282366920938463463374607431768211455), got ${maxUint256}`,
    )
  })
})
