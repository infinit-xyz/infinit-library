import { beforeAll, describe, expect, test } from 'vitest'

import { Address } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupAaveV3 } from '@actions/__mock__/setup'
import { SetLiquidationThresholdSubAction } from '@actions/subactions/setLiquidationThresholdSubAction'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('SetLiquidationThresholdSubAction', () => {
  let subAction: SetLiquidationThresholdSubAction
  let client: TestInfinitWallet
  let pool: Address
  let poolConfigurator: Address
  let aclManager: Address
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const usdt = ARBITRUM_TEST_ADDRESSES.usdt
  const liquidationThreshold = 9000n
  let registry: AaveV3Registry

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, ARBITRUM_TEST_ADDRESSES.tester)
    registry = await setupAaveV3()
    pool = registry.poolProxy!
    poolConfigurator = registry.poolConfiguratorProxy!
    aclManager = registry.aclManager!
  })

  test('validate throw error', async () => {
    subAction = new SetLiquidationThresholdSubAction(client, {
      liquidationThresholdInfos: [
        {
          asset: weth,
          liquidationThreshold: 0n,
        },
      ],
      pool,
      poolConfigurator,
      aclManager,
    })
    await expect(subAction.validate()).rejects.toThrowError()
  })

  test('validate success', async () => {
    subAction = new SetLiquidationThresholdSubAction(client, {
      liquidationThresholdInfos: [
        {
          asset: weth,
          liquidationThreshold: liquidationThreshold,
        },
      ],
      pool,
      poolConfigurator,
      aclManager,
    })
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('execute set 1 asset', async () => {
    subAction = new SetLiquidationThresholdSubAction(client, {
      liquidationThresholdInfos: [
        {
          asset: weth,
          liquidationThreshold: liquidationThreshold,
        },
      ],
      pool,
      poolConfigurator,
      aclManager,
    })

    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    expect(liquidationThreshold).toBe(await getLiquidationThreshold(weth))
  })

  test('execute set 2 assets', async () => {
    subAction = new SetLiquidationThresholdSubAction(client, {
      liquidationThresholdInfos: [
        {
          asset: weth,
          liquidationThreshold: liquidationThreshold,
        },
        {
          asset: usdt,
          liquidationThreshold: liquidationThreshold,
        },
      ],
      pool,
      poolConfigurator,
      aclManager,
    })

    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    expect(liquidationThreshold).toBe(await getLiquidationThreshold(weth))
    expect(liquidationThreshold).toBe(await getLiquidationThreshold(usdt))
  })

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
})
