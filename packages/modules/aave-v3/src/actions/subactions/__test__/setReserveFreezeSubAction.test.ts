import { beforeAll, describe, expect, test } from 'vitest'

import { Address } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupAaveV3 } from '@actions/__mock__/setup'
import { SetReserveFreezeSubAction } from '@actions/subactions/setReserveFreezeSubAction'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('SetReserveFreezeSubAction', async () => {
  let subAction: SetReserveFreezeSubAction
  let client: TestInfinitWallet
  let pool: Address
  let poolConfigurator: Address
  let aclManager: Address
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const usdt = ARBITRUM_TEST_ADDRESSES.usdt
  let registry: AaveV3Registry

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, ARBITRUM_TEST_ADDRESSES.tester)
    registry = await setupAaveV3()
    pool = registry.poolProxy!
    poolConfigurator = registry.poolConfiguratorProxy!
    aclManager = registry.aclManager!
  })
  test('execute freeze 1 asset', async () => {
    subAction = new SetReserveFreezeSubAction(client, {
      reserveFreezeInfos: [
        {
          asset: weth,
          freeze: true,
        },
      ],
      poolConfigurator,
      aclManager,
    })

    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    await expect(getFreeze(weth)).resolves.toBe(true)
    await expect(getFreeze(usdt)).resolves.toBe(false)
  })

  test('execute freeze 2 assets', async () => {
    subAction = new SetReserveFreezeSubAction(client, {
      reserveFreezeInfos: [
        {
          asset: weth,
          freeze: true,
        },
        {
          asset: usdt,
          freeze: true,
        },
      ],
      poolConfigurator,
      aclManager,
    })

    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    await expect(getFreeze(weth)).resolves.toBe(true)
    await expect(getFreeze(usdt)).resolves.toBe(true)
  })

  test('execute unfreeze 1 asset', async () => {
    // freeze first
    subAction = new SetReserveFreezeSubAction(client, {
      reserveFreezeInfos: [
        {
          asset: weth,
          freeze: true,
        },
        {
          asset: usdt,
          freeze: true,
        },
      ],
      poolConfigurator,
      aclManager,
    })

    await subAction.execute(registry, {})
    await expect(getFreeze(weth)).resolves.toBe(true)
    await expect(getFreeze(usdt)).resolves.toBe(true)
    subAction = new SetReserveFreezeSubAction(client, {
      reserveFreezeInfos: [
        {
          asset: weth,
          freeze: false,
        },
      ],
      poolConfigurator,
      aclManager,
    })
    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    await expect(getFreeze(weth)).resolves.toBe(false)
    await expect(getFreeze(usdt)).resolves.toBe(true)
  })

  test('execute unfreeze 2 asset', async () => {
    // freeze first
    subAction = new SetReserveFreezeSubAction(client, {
      reserveFreezeInfos: [
        {
          asset: weth,
          freeze: true,
        },
        {
          asset: usdt,
          freeze: true,
        },
      ],
      poolConfigurator,
      aclManager,
    })

    await subAction.execute(registry, {})
    await expect(getFreeze(weth)).resolves.toBe(true)
    await expect(getFreeze(usdt)).resolves.toBe(true)
    subAction = new SetReserveFreezeSubAction(client, {
      reserveFreezeInfos: [
        {
          asset: weth,
          freeze: false,
        },
        {
          asset: usdt,
          freeze: false,
        },
      ],
      poolConfigurator,
      aclManager,
    })
    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    await expect(getFreeze(weth)).resolves.toBe(false)
    await expect(getFreeze(usdt)).resolves.toBe(false)
  })

  async function getFreeze(asset: Address): Promise<boolean> {
    const poolArtifact = await readArtifact('Pool')
    const reserveData: any = await client.publicClient.readContract({
      address: pool,
      abi: poolArtifact.abi,
      functionName: 'getReserveData',
      args: [asset],
    })
    const config = reserveData.configuration.data
    const FREEZE_MASK = 0xfffffffffffffffffffffffffffffffffffffffffffffffffdffffffffffffffn
    return (config & ~FREEZE_MASK) !== 0n
  }
})
