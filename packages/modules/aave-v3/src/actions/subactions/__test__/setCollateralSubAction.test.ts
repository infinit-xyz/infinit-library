import { beforeAll, describe, expect, test } from 'vitest'

import { Address } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupAaveV3 } from '@actions/__mock__/setup'
import { SetCollateralSubAction } from '@actions/subactions/setCollateralSubAction'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('SetCollateralSubAction', () => {
  let subAction: SetCollateralSubAction
  let client: TestInfinitWallet
  let pool: Address
  let poolConfigurator: Address
  let aclManager: Address
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const usdt = ARBITRUM_TEST_ADDRESSES.usdt
  const ethLtv = 8000n
  const usdtLtv = 7000n
  const ethLiquidationThreshold = 9000n
  const ethLiquidationBonus = 10500n
  const usdtLiquidationThreshold = 8000n
  const usdtLiquidationBonus = 10500n

  let registry: AaveV3Registry

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, ARBITRUM_TEST_ADDRESSES.tester)
    registry = await setupAaveV3()
    pool = registry.poolProxy!
    poolConfigurator = registry.poolConfiguratorProxy!
    aclManager = registry.aclManager!
  })

  test('validate throw error', async () => {
    subAction = new SetCollateralSubAction(client, {
      collateralInfos: [
        {
          asset: weth,
          ltv: 9999n,
          liquidationThreshold: ethLiquidationThreshold,
          liquidationBonus: ethLiquidationBonus,
        },
      ],
      pool,
      poolConfigurator,
      aclManager,
    })
    await expect(subAction.validate()).rejects.toThrowError()
  })

  test('validate success', async () => {
    subAction = new SetCollateralSubAction(client, {
      collateralInfos: [
        {
          asset: weth,
          ltv: ethLtv,
          liquidationThreshold: ethLiquidationThreshold,
          liquidationBonus: ethLiquidationBonus,
        },
      ],
      pool,
      poolConfigurator,
      aclManager,
    })
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('execute set 1 asset', async () => {
    subAction = new SetCollateralSubAction(client, {
      collateralInfos: [
        {
          asset: weth,
          ltv: ethLtv,
          liquidationThreshold: ethLiquidationThreshold,
          liquidationBonus: ethLiquidationBonus,
        },
      ],
      pool,
      poolConfigurator,
      aclManager,
    })

    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    expect(ethLtv).toBe(await getLtv(weth))
    expect(ethLiquidationThreshold).toBe(await getLiquidationThreshold(weth))
    expect(ethLiquidationBonus).toBe(await getLiquidationBonus(weth))
  })

  test('execute set 2 assets', async () => {
    subAction = new SetCollateralSubAction(client, {
      collateralInfos: [
        {
          asset: weth,
          ltv: ethLtv,
          liquidationThreshold: ethLiquidationThreshold,
          liquidationBonus: ethLiquidationBonus,
        },
        {
          asset: usdt,
          ltv: usdtLtv,
          liquidationThreshold: usdtLiquidationThreshold,
          liquidationBonus: usdtLiquidationBonus,
        },
      ],
      pool,
      poolConfigurator,
      aclManager,
    })

    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    expect(ethLtv).toBe(await getLtv(weth))
    expect(ethLiquidationThreshold).toBe(await getLiquidationThreshold(weth))
    expect(ethLiquidationBonus).toBe(await getLiquidationBonus(weth))
    expect(usdtLtv).toBe(await getLtv(usdt))
    expect(usdtLiquidationThreshold).toBe(await getLiquidationThreshold(usdt))
    expect(usdtLiquidationBonus).toBe(await getLiquidationBonus(usdt))
  })

  async function getLiquidationBonus(asset: Address): Promise<bigint> {
    const poolArtifact = await readArtifact('Pool')
    const reserveData: any = await client.publicClient.readContract({
      address: pool,
      abi: poolArtifact.abi,
      functionName: 'getReserveData',
      args: [asset],
    })
    const config = reserveData.configuration.data
    //bit 32-47: Liq. bonus
    const LIQUIDATION_BONUS_MASK = 0xffffffffffffffffffffffffffffffffffffffffffffffffffff0000ffffffffn
    const LIQUIDATION_BONUS_SHIFT = 32n
    return (config & ~LIQUIDATION_BONUS_MASK) >> LIQUIDATION_BONUS_SHIFT
  }

  async function getLiquidationThreshold(asset: Address): Promise<bigint> {
    const poolArtifact = await readArtifact('Pool')
    const reserveData: any = await client.publicClient.readContract({
      address: pool,
      abi: poolArtifact.abi,
      functionName: 'getReserveData',
      args: [asset],
    })
    const config = reserveData.configuration.data
    //bit 16-31: Liq. threshold
    const LIQUIDATION_THRESHOLD_MASK = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000ffffn
    const LIQUIDATION_THRESHOLD_SHIFT = 16n
    return (config & ~LIQUIDATION_THRESHOLD_MASK) >> LIQUIDATION_THRESHOLD_SHIFT
  }

  async function getLtv(asset: Address): Promise<bigint> {
    const poolArtifact = await readArtifact('Pool')
    const reserveData: any = await client.publicClient.readContract({
      address: pool,
      abi: poolArtifact.abi,
      functionName: 'getReserveData',
      args: [asset],
    })
    const config = reserveData.configuration.data
    const LTV_MASK = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000n
    return config & ~LTV_MASK
  }
})
