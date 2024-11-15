import { describe, expect, test } from 'vitest'

import { encodeFunctionData, getAddress, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupInitCapital } from '@actions/__mock__/setup'
import { SetMinLiqIncentiveMultiplierE18TxBuilder } from '@actions/subactions/tx-builders/LiqIncentiveCalculator/setMinLiqIncentiveMultiplier_e18'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester
const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetMinLiqIncentiveMultiplierE18TxBuilder', async () => {
  let txBuilder: SetMinLiqIncentiveMultiplierE18TxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test calldata', async () => {
    txBuilder = new SetMinLiqIncentiveMultiplierE18TxBuilder(client, {
      // mock data, no need to use the real address
      liqIncentiveCalculator: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      modes: [1, 2],
      minMultipliers_e18: [parseUnits('1.1', 18), parseUnits('1.1', 18)],
    })
    const txData = await txBuilder.buildTx()

    const liqIncentiveCalculatorArtifact = await readArtifact('LiqIncentiveCalculator')

    const mockTxData = encodeFunctionData({
      abi: liqIncentiveCalculatorArtifact.abi,
      functionName: 'setMinLiqIncentiveMultiplier_e18',
      args: [
        [1, 2],
        [parseUnits('1.1', 18), parseUnits('1.1', 18)],
      ],
    })

    expect(mockTxData === txData.data).toBeTruthy()
    expect('0xCD399994982B3a3836B8FE81f7127cC5148e9BaE' === txData.to).toBeTruthy()
  })

  test('test validate mismatched length should be failed', async () => {
    txBuilder = new SetMinLiqIncentiveMultiplierE18TxBuilder(client, {
      // mock data, no need to use the real address
      liqIncentiveCalculator: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      modes: [1, 2],
      minMultipliers_e18: [parseUnits('1.1', 18)],
    })
    expect(txBuilder.validate()).rejects.toThrowError('LENGTH_MISMATCH')
  })

  test('test validate should be passed', async () => {
    const registry = await setupInitCapital()
    const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
    const client2 = new TestInfinitWallet(TestChain.arbitrum, account2.address)
    if (!registry.liqIncentiveCalculatorProxy) throw new Error('liqIncentiveCalculatorProxy is not found in registry')
    const liqIncentiveCalculator = getAddress(registry.liqIncentiveCalculatorProxy)
    txBuilder = new SetMinLiqIncentiveMultiplierE18TxBuilder(client2, {
      liqIncentiveCalculator: liqIncentiveCalculator,
      modes: [1, 2],
      minMultipliers_e18: [parseUnits('1.1', 18), parseUnits('1.1', 18)],
    })
    expect(txBuilder.validate()).resolves.not.toThrow()
  })
})
