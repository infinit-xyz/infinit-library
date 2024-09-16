import { describe, expect, test } from 'vitest'

import { decodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet, TransactionData } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { ConfigureReserveAsCollateralTxBuilder } from '@actions/subactions/tx-builders/poolConfigurator/configureReserveAsCollateral'
import { getLiquidationBonus, getLiquidationThreshold, getLtv, getReserveData } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet, getForkRpcUrl } from '@infinit-xyz/test'

// anvil tester pk
const privateKey = ANVIL_PRIVATE_KEY
const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor

// NOTE: test with Aave v3 on arbitrum
describe('ConfigureReserveAsCollateralTxBuilder', () => {
  let txBuilder: ConfigureReserveAsCollateralTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  const badClient: InfinitWallet = new InfinitWallet(arbitrum, getForkRpcUrl(TestChain.arbitrum), privateKeyToAccount(privateKey))
  const pool = ARBITRUM_TEST_ADDRESSES.pool
  const poolConfigurator = ARBITRUM_TEST_ADDRESSES.poolConfigurator
  const aclManager = ARBITRUM_TEST_ADDRESSES.aclManager
  const weth = ARBITRUM_TEST_ADDRESSES.weth

  // **test validate
  // *test sender
  test('validate sender throw error', async () => {
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(badClient, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      ltv: 8000n,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('NOT_RISK_OR_POOL_ADMIN')
  })
  // note: empty pool will be tested in integration test
  // *test ltv only
  // throw error
  // - LTV should be less than liquidation threshold
  test('validate ltv only throw error LTV should be less than liquidation threshold', async () => {
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(client, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      ltv: 9999n,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('LTV should be less than liquidation threshold')
  })

  // no error
  test('validate ltv only no error', async () => {
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(client, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      ltv: 8000n,
    })
    await expect(txBuilder.validate()).resolves.not.toThrowError()
  })
  // *test liquidation bonus only
  // throw error
  // - Liquidation bonus should be greater than 10_000
  test('validate liquidation bonus only throw error Liquidation bonus should be greater than 10_000', async () => {
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(client, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      liquidationBonus: 9999n,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('Invalid Reserve Params')
  })
  // no error
  test('validate liquidation bonus only no error', async () => {
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(client, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      liquidationBonus: 10050n,
    })
    await expect(txBuilder.validate()).resolves.not.toThrowError()
  })
  // *test liquidation threshold only
  // throw error
  // - LTV should be less than liquidation threshold
  test('validate liquidation threshold only throw error LTV should be less than liquidation threshold', async () => {
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(client, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      liquidationThreshold: 5000n,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('LTV should be less than liquidation threshold')
  })
  // - Liquidation bonus should be 0 if liquidation threshold is 0
  test('validate liquidation threshold only throw error Liquidation bonus should be 0 if liquidation threshold is 0', async () => {
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(client, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      ltv: 0n,
      liquidationThreshold: 0n,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('Liquidation bonus should be 0 if liquidation threshold is 0')
  })
  // no error
  test('validate liquidation threshold only no error', async () => {
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(client, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      liquidationThreshold: 9999n,
    })
    await expect(txBuilder.validate()).resolves.not.toThrowError()
  })
  // *test all params
  // no error
  test('validate all params', async () => {
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(client, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      ltv: 8000n,
      liquidationThreshold: 9999n,
      liquidationBonus: 10100n,
    })
    await expect(txBuilder.validate()).resolves.not.toThrowError()
  })
  // - ltv should be less than liquidation threshold
  test('validate all params throw error LTV should be less than liquidation threshold', async () => {
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(client, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      ltv: 9999n,
      liquidationThreshold: 8000n,
      liquidationBonus: 10100n,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('LTV should be less than liquidation threshold')
  })
  // - Liquidation bonus should be 0 if liquidation threshold is 0
  test('validate all params throw error Liquidation bonus should be 0 if liquidation threshold is 0', async () => {
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(client, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      ltv: 0n,
      liquidationThreshold: 0n,
      liquidationBonus: 10100n,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('Liquidation bonus should be 0 if liquidation threshold is 0')
  })
  // - Invalid Reserve Params (liquidation threshold * liquidation bonus + 5e3) / 1e4 <= 1e4
  test('validate all params throw error Invalid Reserve Params', async () => {
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(client, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      ltv: 1n,
      liquidationThreshold: 10n,
      liquidationBonus: 1n,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('Invalid Reserve Params')
  })

  // **test getTx
  // *test ltv only
  test('getTx: ltv only', async () => {
    const ltv = 8000n
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(client, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      ltv,
    })

    const tx = await txBuilder.getTx()

    await checkTxData(tx, ltv)
  })
  // *test liquidation threshold only
  test('getTx: liquidation threshold only', async () => {
    const liquidationThreshold = 9999n
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(client, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      liquidationThreshold,
    })

    const tx = await txBuilder.getTx()

    await checkTxData(tx, undefined, liquidationThreshold)
  })
  // *test liquidation bonus only
  test('getTx: liquidation bonus only', async () => {
    const liquidationBonus = 10050n
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(client, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      liquidationBonus,
    })

    const tx = await txBuilder.getTx()
    await checkTxData(tx, undefined, undefined, liquidationBonus)
  })
  // *test all params
  test('getTx: all params', async () => {
    const ltv = 8000n
    const liquidationThreshold = 9999n
    const liquidationBonus = 10100n
    txBuilder = new ConfigureReserveAsCollateralTxBuilder(client, {
      asset: weth,
      pool,
      poolConfigurator,
      aclManager: aclManager,
      ltv,
      liquidationThreshold,
      liquidationBonus,
    })

    const tx = await txBuilder.getTx()

    await checkTxData(tx, ltv, liquidationThreshold, liquidationBonus)
  })

  async function checkTxData(tx: TransactionData, ltv?: bigint, liquidationThreshold?: bigint, liquidationBonus?: bigint) {
    expect(tx).not.toBeUndefined()
    expect(tx.to).toBe(poolConfigurator)
    expect(tx.data).not.toBeUndefined()
    const [poolArtifact, poolConfiguratorArtifact] = await Promise.all([readArtifact('Pool'), readArtifact('PoolConfigurator')])
    const calldata = tx.data ?? '0x0'
    const decodedData = decodeFunctionData({ abi: poolConfiguratorArtifact.abi, data: calldata })
    expect(decodedData.functionName).toBe('configureReserveAsCollateral')
    const reserveData: any = await getReserveData(client, poolArtifact, pool, weth)
    const config = reserveData.configuration.data
    const expectedLtv = ltv ?? getLtv(config)
    const expectedLiquidationThreshold = liquidationThreshold ?? getLiquidationThreshold(config)
    const expectedLiquidationBonus = liquidationBonus ?? getLiquidationBonus(config)
    expect(decodedData.args.length).toEqual(4)
    expect(decodedData.args[0]).toEqual(weth)
    expect(decodedData.args[1]).toEqual(expectedLtv)
    expect(decodedData.args[2]).toEqual(expectedLiquidationThreshold)
    expect(decodedData.args[3]).toEqual(expectedLiquidationBonus)
  }
})
