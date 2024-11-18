import { describe, expect, test } from 'vitest'

import { encodeFunctionData, getAddress, parseUnits } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupInitCapital } from '@actions/__mock__/setup'
import { SetModeDebtCeilingInfoTxBuilder } from '@actions/subactions/tx-builders/RiskManager/setModeDebtCeilingInfo'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester
const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetModeDebtCeilingInfoTxBuilder', async () => {
  let txBuilder: SetModeDebtCeilingInfoTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test calldata', async () => {
    txBuilder = new SetModeDebtCeilingInfoTxBuilder(client, {
      // mock data, no need to use the real address
      riskManager: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      mode: 1,
      pools: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
      ceilAmts: [parseUnits('10000000', 18), parseUnits('10000000', 18)],
    })
    const txData = await txBuilder.buildTx()

    const riskManagerArtifact = await readArtifact('RiskManager')

    const mockTxData = encodeFunctionData({
      abi: riskManagerArtifact.abi,
      functionName: 'setModeDebtCeilingInfo',
      args: [
        1,
        ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
        [parseUnits('10000000', 18), parseUnits('10000000', 18)],
      ],
    })

    expect(mockTxData === txData.data).toBeTruthy()
    expect('0xCD399994982B3a3836B8FE81f7127cC5148e9BaE' === txData.to).toBeTruthy()
  })

  test('test validate mismatched length should be failed', async () => {
    txBuilder = new SetModeDebtCeilingInfoTxBuilder(client, {
      // mock data, no need to use the real address
      riskManager: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      mode: 1,
      pools: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
      ceilAmts: [parseUnits('10000000', 18)],
    })
    expect(txBuilder.validate()).rejects.toThrowError('LENGTH_MISMATCH')
  })

  test('test validate should be passed', async () => {
    const registry = await setupInitCapital()
    if (!registry.riskManagerProxy) throw new Error('riskManagerProxy is not found in registry')
    const riskManager = getAddress(registry.riskManagerProxy)
    txBuilder = new SetModeDebtCeilingInfoTxBuilder(client, {
      riskManager: riskManager,
      mode: 1,
      pools: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
      ceilAmts: [parseUnits('10000000', 18), parseUnits('10000000', 18)],
    })
    expect(txBuilder.validate()).resolves.not.toThrow()
  })
})
