import { describe, expect, test } from 'vitest'

import { decodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet, TransactionData } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES, TEST_ADDRESSES } from '@actions/__mock__/address'
import { AddPoolAdminACLManagerTxBuilder } from '@actions/subactions/tx-builders/aclManager/addPoolAdmin'

import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet, getForkRpcUrl } from '@infinit-xyz/test'

// anvil tester pk
const privateKey = ANVIL_PRIVATE_KEY
const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor
const bob = TEST_ADDRESSES.bob

// NOTE: test with Aave v3 on arbitrum
describe('AddPoolAdminTxBuilder', () => {
  let txBuilder: AddPoolAdminACLManagerTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  const badClient: InfinitWallet = new InfinitWallet(arbitrum, getForkRpcUrl(TestChain.arbitrum), privateKeyToAccount(privateKey))
  const aclManager = ARBITRUM_TEST_ADDRESSES.aclManager

  // **test validate
  // *test sender
  test('validate client not default admin', async () => {
    txBuilder = new AddPoolAdminACLManagerTxBuilder(badClient, {
      aclManager: aclManager,
      poolAdmin: bob,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('NOT_DEFAULT_ADMIN')
  })

  test('validate add pool admin', async () => {
    txBuilder = new AddPoolAdminACLManagerTxBuilder(client, {
      aclManager: aclManager,
      poolAdmin: bob,
    })
    await txBuilder.validate()

    const tx = await txBuilder.getTx()
    expect(tx).not.toBeUndefined()
    expect(tx.to).toBe(aclManager)
    await checkTx(tx)
  })

  async function checkTx(tx: TransactionData) {
    expect(tx).not.toBeUndefined()
    expect(tx.to).toBe(aclManager)
    expect(tx.data).toBeDefined()
    const calldata = tx.data ?? '0x0'
    const artifact = await readArtifact('ACLManager')
    const decodedData = decodeFunctionData({ abi: artifact.abi, data: calldata })
    expect(decodedData.functionName).toBe('addPoolAdmin')
    expect(decodedData.args.length).toEqual(1)
    expect(decodedData.args[0]).toEqual(bob)
  }
})