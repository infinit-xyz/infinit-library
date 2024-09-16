import { describe, expect, test } from 'vitest'

import { decodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet, TransactionData } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetReservePauseTxBuilder } from '@actions/subactions/tx-builders/poolConfigurator/setReservePause'

import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet, getForkRpcUrl } from '@infinit-xyz/test'

// anvil tester pk
const privateKey = ANVIL_PRIVATE_KEY
const tester = ARBITRUM_TEST_ADDRESSES.aaveEmergencyAdmin

// NOTE: test with Aave v3 on arbitrum
describe('SetReservePauseTxBuilder', () => {
  let txBuilder: SetReservePauseTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  const badClient: InfinitWallet = new InfinitWallet(arbitrum, getForkRpcUrl(TestChain.arbitrum), privateKeyToAccount(privateKey))
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const poolConfigurator = ARBITRUM_TEST_ADDRESSES.poolConfigurator
  const aclManager = ARBITRUM_TEST_ADDRESSES.aclManager

  // **test validate
  // *test sender
  test('validate sender throw error', async () => {
    txBuilder = new SetReservePauseTxBuilder(badClient, {
      asset: weth,
      poolConfigurator: poolConfigurator,
      aclManager: aclManager,
      paused: true,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('NOT_EMERGENCY_OR_POOL_ADMIN')
  })

  // **test buildTx
  // *test pause
  test('getTx: reserve paused', async () => {
    txBuilder = new SetReservePauseTxBuilder(client, {
      asset: weth,
      poolConfigurator: poolConfigurator,
      aclManager: aclManager,
      paused: true,
    })
    const tx = await txBuilder.getTx()
    expect(tx).not.toBeUndefined()
    expect(tx.to).toBe(poolConfigurator)
    await checkTx(tx, true)
  })

  // *test unpause
  test('getTx: reserve unfreeze', async () => {
    txBuilder = new SetReservePauseTxBuilder(client, {
      asset: weth,
      poolConfigurator: poolConfigurator,
      aclManager: aclManager,
      paused: false,
    })

    const tx = await txBuilder.getTx()
    await checkTx(tx, false)
  })

  async function checkTx(tx: TransactionData, paused: boolean) {
    expect(tx).not.toBeUndefined()
    expect(tx.to).toBe(poolConfigurator)
    expect(tx.data).toBeDefined()
    const calldata = tx.data ?? '0x0'
    const poolConfiguratorArtifact = await readArtifact('PoolConfigurator')
    const decodedData = decodeFunctionData({ abi: poolConfiguratorArtifact.abi, data: calldata })
    expect(decodedData.functionName).toBe('setReservePause')
    expect(decodedData.args.length).toEqual(2)
    expect(decodedData.args[0]).toEqual(weth)
    expect(decodedData.args[1]).toEqual(paused)
  }
})
