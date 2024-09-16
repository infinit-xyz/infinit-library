import { beforeAll, describe, expect, test } from 'vitest'

import { Address } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupAaveV3 } from '@actions/__mock__/setup'
import { SetLiquidationBonusSubAction } from '@actions/subactions/setLiquidationBonusSubAction'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('SetLiquidationBonusSubAction', () => {
  let subAction: SetLiquidationBonusSubAction
  let client: TestInfinitWallet
  let pool: Address
  let poolConfigurator: Address
  let aclManager: Address
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const usdt = ARBITRUM_TEST_ADDRESSES.usdt
  const liquidationBonus = 10050n
  let registry: AaveV3Registry

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, ARBITRUM_TEST_ADDRESSES.tester)
    registry = await setupAaveV3()
    pool = registry.poolProxy!
    poolConfigurator = registry.poolConfiguratorProxy!
    aclManager = registry.aclManager!
  })

  test('validate throw error', async () => {
    subAction = new SetLiquidationBonusSubAction(client, {
      liquidationBonusInfos: [
        {
          asset: weth,
          liquidationBonus: 0n,
        },
      ],
      pool,
      poolConfigurator,
      aclManager,
    })
    await expect(subAction.validate()).rejects.toThrowError()
  })

  test('validate success', async () => {
    subAction = new SetLiquidationBonusSubAction(client, {
      liquidationBonusInfos: [
        {
          asset: weth,
          liquidationBonus: liquidationBonus,
        },
      ],
      pool,
      poolConfigurator,
      aclManager,
    })
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('execute set 1 asset', async () => {
    subAction = new SetLiquidationBonusSubAction(client, {
      liquidationBonusInfos: [
        {
          asset: weth,
          liquidationBonus: liquidationBonus,
        },
      ],
      pool,
      poolConfigurator,
      aclManager,
    })
    const registry = {}

    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    expect(liquidationBonus).toBe(await getLiquidationBonus(weth))
  })

  test('execute set 2 assets', async () => {
    subAction = new SetLiquidationBonusSubAction(client, {
      liquidationBonusInfos: [
        {
          asset: weth,
          liquidationBonus: liquidationBonus,
        },
        {
          asset: usdt,
          liquidationBonus: liquidationBonus,
        },
      ],
      pool,
      poolConfigurator,
      aclManager,
    })
    const registry = {}

    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    expect(liquidationBonus).toBe(await getLiquidationBonus(weth))
    expect(liquidationBonus).toBe(await getLiquidationBonus(usdt))
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
})
