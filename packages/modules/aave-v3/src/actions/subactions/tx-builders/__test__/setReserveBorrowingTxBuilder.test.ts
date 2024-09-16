import { describe, expect, test } from 'vitest'

import { decodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet, TransactionData } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetReserveBorrowingTxBuilder } from '@actions/subactions/tx-builders/poolConfigurator/setReserveBorrowing'

import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet, getForkRpcUrl } from '@infinit-xyz/test'

// anvil tester pk
const privateKey = ANVIL_PRIVATE_KEY
const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor

// NOTE: test with Aave v3 on arbitrum
describe('SetReserveBorrowingTxBuilder', () => {
  let txBuilder: SetReserveBorrowingTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  const badClient: InfinitWallet = new InfinitWallet(arbitrum, getForkRpcUrl(TestChain.arbitrum), privateKeyToAccount(privateKey))
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const poolConfigurator = ARBITRUM_TEST_ADDRESSES.poolConfigurator
  const aclManager = ARBITRUM_TEST_ADDRESSES.aclManager

  // **test validate
  // *test sender
  test('validate sender throw error', async () => {
    txBuilder = new SetReserveBorrowingTxBuilder(badClient, {
      asset: weth,
      poolConfigurator,
      aclManager: aclManager,
      enabled: true,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('NOT_RISK_OR_POOL_ADMIN')
  })

  // **test buildTxs
  // *test enabled borrowing
  test('getTx: enabled', async () => {
    txBuilder = new SetReserveBorrowingTxBuilder(client, {
      asset: weth,
      poolConfigurator,
      aclManager: aclManager,
      enabled: true,
    })

    const tx = await txBuilder.getTx()
    expect(tx).not.toBeUndefined()
    expect(tx.to).toBe(poolConfigurator)
    await checkTx(tx, true)
  })

  // *test disabled borrowing
  test('getTx: reserve unenabled', async () => {
    txBuilder = new SetReserveBorrowingTxBuilder(client, {
      asset: weth,
      poolConfigurator,
      aclManager: aclManager,
      enabled: false,
    })

    const tx = await txBuilder.getTx()
    await checkTx(tx, false)
  })

  async function checkTx(tx: TransactionData, enabled: boolean) {
    expect(tx).not.toBeUndefined()
    expect(tx.to).toBe(poolConfigurator)
    expect(tx.data).toBeDefined()
    const calldata = tx.data ?? '0x0'
    const poolConfiguratorArtifact = await readArtifact('PoolConfigurator')
    const decodedData = decodeFunctionData({ abi: poolConfiguratorArtifact.abi, data: calldata })
    expect(decodedData.functionName).toBe('setReserveBorrowing')
    expect(decodedData.args.length).toEqual(2)
    expect(decodedData.args[0]).toEqual(weth)
    expect(decodedData.args[1]).toEqual(enabled)
  }
})
