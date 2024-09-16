import { describe, expect, test } from 'vitest'

import { decodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet, TransactionData } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetPoolPauseTxBuilder } from '@actions/subactions/tx-builders/poolConfigurator/setPoolPause'

import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet, getForkRpcUrl } from '@infinit-xyz/test'

// anvil tester pk
const privateKey = ANVIL_PRIVATE_KEY
const tester = ARBITRUM_TEST_ADDRESSES.aaveEmergencyAdmin

// NOTE: test with Aave v3 on arbitrum
describe('SetPoolPauseTxBuilderTxBuilder', () => {
  let txBuilder: SetPoolPauseTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  const badClient: InfinitWallet = new InfinitWallet(arbitrum, getForkRpcUrl(TestChain.arbitrum), privateKeyToAccount(privateKey))
  const poolConfigurator = ARBITRUM_TEST_ADDRESSES.poolConfigurator
  const aclManager = ARBITRUM_TEST_ADDRESSES.aclManager

  // **test validate
  // *test sender
  test('validate sender throw error', async () => {
    txBuilder = new SetPoolPauseTxBuilder(badClient, {
      poolConfigurator: poolConfigurator,
      aclManager: aclManager,
      paused: true,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('NOT_EMERGENCY_ADMIN')
  })

  // **test buildTx
  // *test pause
  test('getTx: pool pause', async () => {
    txBuilder = new SetPoolPauseTxBuilder(client, {
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
  test('getTx: pool unpause', async () => {
    txBuilder = new SetPoolPauseTxBuilder(client, {
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
    expect(decodedData.functionName).toBe('setPoolPause')
    expect(decodedData.args.length).toEqual(1)
    expect(decodedData.args[0]).toEqual(paused)
  }
})
