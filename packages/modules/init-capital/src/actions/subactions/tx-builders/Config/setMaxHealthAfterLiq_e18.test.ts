import { beforeAll, describe, expect, test } from 'vitest'

import { Address, encodeFunctionData, getAddress, maxUint64, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { setupInitCapital } from '@actions/__mock__/setup'

import { SetMaxHealthAfterLiqE18TxBuilder } from './setMaxHealthAfterLiq_e18'
import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester
describe('SetMaxHealthAfterLiqE18TxBuilder', async () => {
  let registry: InitCapitalRegistry
  let txBuilder: SetMaxHealthAfterLiqE18TxBuilder
  const account1 = privateKeyToAccount(ANVIL_PRIVATE_KEY)
  const client = new TestInfinitWallet(TestChain.arbitrum, account1.address)
  const oneE18 = parseUnits('1', 18)
  let configProxy: Address

  beforeAll(async () => {
    registry = await setupInitCapital()
    if (!registry.configProxy) throw new Error('configProxy is not found in registry')
    configProxy = getAddress(registry.configProxy)
  })

  test("test tx builder's calldata should be matched with mock data", async () => {
    txBuilder = new SetMaxHealthAfterLiqE18TxBuilder(client, {
      config: configProxy,
      mode: 1,
      maxHealthAfterLiq_e18: oneE18,
    })
    const txData = await txBuilder.buildTx()

    const configArtifact = await readArtifact('Config')

    const mockTxData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setMaxHealthAfterLiq_e18',
      args: [1, oneE18],
    })
    expect(mockTxData === txData.data).toBeTruthy()
    expect(configProxy === txData.to).toBeTruthy()
  })

  test('test set maxHealth below 1e18 should throw error on validation', async () => {
    txBuilder = new SetMaxHealthAfterLiqE18TxBuilder(client, {
      config: configProxy,
      mode: 1,
      maxHealthAfterLiq_e18: 1n,
    })
    expect(txBuilder.validate()).rejects.toThrowError(
      'MaxHealthAfterLiq must be between 1000000000000000000(oneE18) and 18446744073709551615)(maxUint64), found 1',
    )
  })

  test('test set maxHealth greater than maxUint64 should throw error on validation', async () => {
    txBuilder = new SetMaxHealthAfterLiqE18TxBuilder(client, {
      config: configProxy,
      mode: 1,
      maxHealthAfterLiq_e18: maxUint64 + 1n,
    })
    expect(txBuilder.validate()).rejects.toThrowError(
      `MaxHealthAfterLiq must be between 1000000000000000000(oneE18) and 18446744073709551615)(maxUint64), found ${maxUint64 + 1n}`,
    )
  })

  test('test mode zero should throw error on validation', async () => {
    txBuilder = new SetMaxHealthAfterLiqE18TxBuilder(client, {
      config: configProxy,
      mode: 0,
      maxHealthAfterLiq_e18: oneE18,
    })
    expect(txBuilder.validate()).rejects.toThrowError('Mode should not be zero')
  })

  test('test validate should be passed', async () => {
    txBuilder = new SetMaxHealthAfterLiqE18TxBuilder(client, {
      config: configProxy,
      mode: 1,
      maxHealthAfterLiq_e18: oneE18,
    })
    expect(txBuilder.validate()).resolves.not.toThrow()
  })
})
