import { describe, expect, test } from 'vitest'

import { Address, decodeFunctionData, zeroAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet, TransactionData } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetReserveInterestRateStrategyAddressTxBuilder } from '@actions/subactions/tx-builders/poolConfigurator/setReserveInterestRateStrategyAddress'

import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet, getForkRpcUrl } from '@infinit-xyz/test'

// anvil tester pk
const privateKey = ANVIL_PRIVATE_KEY
const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor

// NOTE: test with Aave v3 on arbitrum
describe('SetReserveInterestRateStrategyAddressTxBuilder', () => {
  let txBuilder: SetReserveInterestRateStrategyAddressTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  const badClient: InfinitWallet = new InfinitWallet(arbitrum, getForkRpcUrl(TestChain.arbitrum), privateKeyToAccount(privateKey))
  const pool = ARBITRUM_TEST_ADDRESSES.pool
  const poolConfigurator = ARBITRUM_TEST_ADDRESSES.poolConfigurator
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const pepe = ARBITRUM_TEST_ADDRESSES.pepe
  const interestRateStrategyAddress = ARBITRUM_TEST_ADDRESSES.interestRateStrategyAddress
  const aclManager = ARBITRUM_TEST_ADDRESSES.aclManager

  // **test validate
  // *test sender
  test('validate sender throw error', async () => {
    txBuilder = new SetReserveInterestRateStrategyAddressTxBuilder(badClient, {
      asset: weth,
      interestRateStrategy: interestRateStrategyAddress,
      poolConfigurator: poolConfigurator,
      aclManager: aclManager,
      pool: pool,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('NOT_RISK_OR_POOL_ADMIN')
  })

  // *validate address 0
  test('validate: address 0', async () => {
    txBuilder = new SetReserveInterestRateStrategyAddressTxBuilder(client, {
      asset: zeroAddress,
      interestRateStrategy: interestRateStrategyAddress,
      poolConfigurator: poolConfigurator,
      aclManager: aclManager,
      pool: pool,
    })
    await expect(txBuilder.validate()).rejects.toThrowError(new ValidateInputZeroAddressError('ASSET'))
  })
  // *validate not listed reserve
  test('validate: not listed reserve', async () => {
    txBuilder = new SetReserveInterestRateStrategyAddressTxBuilder(client, {
      asset: pepe,
      interestRateStrategy: interestRateStrategyAddress,
      poolConfigurator: poolConfigurator,
      aclManager: aclManager,
      pool: pool,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('ASSET_NOT_LISTED')
  })
  // *validate no error
  test('validate: no error', async () => {
    txBuilder = new SetReserveInterestRateStrategyAddressTxBuilder(client, {
      asset: weth,
      interestRateStrategy: interestRateStrategyAddress,
      poolConfigurator: poolConfigurator,
      aclManager: aclManager,
      pool: pool,
    })
    await expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  // **test buildTx
  // *test pause
  test('getTx: set interestRateStrategy', async () => {
    txBuilder = new SetReserveInterestRateStrategyAddressTxBuilder(client, {
      asset: weth,
      interestRateStrategy: interestRateStrategyAddress,
      poolConfigurator: poolConfigurator,
      aclManager: aclManager,
      pool: pool,
    })
    const tx = await txBuilder.getTx()
    expect(tx).not.toBeUndefined()
    expect(tx.to).toBe(poolConfigurator)
    await checkTx(tx, weth, interestRateStrategyAddress)
  })

  async function checkTx(tx: TransactionData, asset: Address, interestRateStrategy: Address) {
    expect(tx).not.toBeUndefined()
    expect(tx.to).toBe(poolConfigurator)
    expect(tx.data).toBeDefined()
    const calldata = tx.data ?? '0x0'
    const poolConfiguratorArtifact = await readArtifact('PoolConfigurator')
    const decodedData = decodeFunctionData({ abi: poolConfiguratorArtifact.abi, data: calldata })
    expect(decodedData.functionName).toBe('setReserveInterestRateStrategyAddress')
    expect(decodedData.args.length).toEqual(2)
    expect(decodedData.args[0]).toEqual(asset)
    expect(decodedData.args[1]).toEqual(interestRateStrategy)
  }
})
