import { beforeAll, describe, expect, test } from 'vitest'

import { Address, encodeFunctionData, getAddress, maxUint256, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { setupInitCapital } from '@actions/__mock__/setup'

import { SetCollFactorE18TxBuilder } from './setCollFactors_e18'
import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester
describe('SetCollFactorsE18', async () => {
  let registry: InitCapitalRegistry
  let txBuilder: SetCollFactorE18TxBuilder
  const account1 = privateKeyToAccount(ANVIL_PRIVATE_KEY)
  const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
  const client = new TestInfinitWallet(TestChain.arbitrum, account1.address)
  const governor = new TestInfinitWallet(TestChain.arbitrum, account2.address)
  const oneE18 = parseUnits('1', 18)

  let configProxy: Address

  beforeAll(async () => {
    registry = await setupInitCapital()
    if (!registry.configProxy) throw new Error('configProxy is not found in registry')
    configProxy = getAddress(registry.configProxy)
  })

  test("test tx builder's calldata should be matched with mock data", async () => {
    txBuilder = new SetCollFactorE18TxBuilder(client, {
      config: configProxy,
      mode: 1,
      pools: ['0x0000000000000000000000000000000000000001'],
      factors_e18: [1n],
    })
    const txData = await txBuilder.buildTx()

    const configArtifact = await readArtifact('Config')

    const mockTxData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setCollFactors_e18',
      args: [1, ['0x0000000000000000000000000000000000000001'], [1n]],
    })
    expect(mockTxData === txData.data).toBeTruthy()
    expect(configProxy === txData.to).toBeTruthy()
  })

  test('test pool zero address should throw error on validation', async () => {
    txBuilder = new SetCollFactorE18TxBuilder(client, {
      config: configProxy,
      mode: 1,
      pools: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000'],
      factors_e18: [1n, 1n],
    })
    expect(txBuilder.validate()).rejects.toThrowError('POOL (INDEX:1) SHOULD_NOT_BE_ZERO_ADDRESS')
  })

  test('test negative factor should thorw error on validation', async () => {
    txBuilder = new SetCollFactorE18TxBuilder(client, {
      config: configProxy,
      mode: 2,
      pools: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
      factors_e18: [-1n, 1n],
    })
    expect(txBuilder.validate()).rejects.toThrowError(`Collateral factor (index: 0) is out of range (min: 0n, max: ${oneE18}n), got -1n`)
  })

  test('test too large factor should throw error on validation', async () => {
    txBuilder = new SetCollFactorE18TxBuilder(client, {
      config: configProxy,
      mode: 2,
      pools: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
      factors_e18: [1n, maxUint256],
    })
    expect(txBuilder.validate()).rejects.toThrowError(
      `Collateral factor (index: 1) is out of range (min: 0n, max: ${oneE18}n), got ${maxUint256}n`,
    )
  })
  test('test validate should be passed', async () => {
    expect(registry.configProxy).toBeTruthy()
    txBuilder = new SetCollFactorE18TxBuilder(governor, {
      config: registry.configProxy!,
      mode: 2,
      pools: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
      factors_e18: [parseUnits('1', 18), 0n],
    })
    expect(txBuilder.validate()).resolves.not.toThrow()
  })
})
