import { beforeAll, describe, expect, test } from 'vitest'

import { Address } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupAaveV3 } from '@actions/__mock__/setup'
import { SetReserveBorrowingSubAction } from '@actions/subactions/setReserveBorrowingSubAction'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('SetReserveBorrowingSubAction', () => {
  let subAction: SetReserveBorrowingSubAction
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

  test('execute disable borrowing 1 asset', async () => {
    subAction = new SetReserveBorrowingSubAction(client, {
      reserveBorrowingInfos: [
        {
          asset: weth,
          enabled: true,
        },
        {
          asset: usdt,
          enabled: true,
        },
      ],
      poolConfigurator,
      aclManager,
    })
    await subAction.execute(registry, {})
    subAction = new SetReserveBorrowingSubAction(client, {
      reserveBorrowingInfos: [
        {
          asset: weth,
          enabled: false,
        },
      ],
      poolConfigurator,
      aclManager,
    })
    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    await expect(getBorrowing(weth)).resolves.toBe(false)
    await expect(getBorrowing(usdt)).resolves.toBe(true)
  })

  test('execute disable borrowing 2 assets', async () => {
    subAction = new SetReserveBorrowingSubAction(client, {
      reserveBorrowingInfos: [
        {
          asset: weth,
          enabled: true,
        },
        {
          asset: usdt,
          enabled: true,
        },
      ],
      poolConfigurator,
      aclManager,
    })
    await subAction.execute(registry, {})
    subAction = new SetReserveBorrowingSubAction(client, {
      reserveBorrowingInfos: [
        {
          asset: weth,
          enabled: false,
        },
        {
          asset: usdt,
          enabled: false,
        },
      ],
      poolConfigurator,
      aclManager,
    })
    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    await expect(getBorrowing(weth)).resolves.toBe(false)
    await expect(getBorrowing(usdt)).resolves.toBe(false)
  })

  test('execute enable borrowing 1 asset', async () => {
    await subAction.execute(registry, {})
    await expect(getBorrowing(weth)).resolves.toBe(false)
    await expect(getBorrowing(usdt)).resolves.toBe(false)

    subAction = new SetReserveBorrowingSubAction(client, {
      reserveBorrowingInfos: [
        {
          asset: weth,
          enabled: true,
        },
      ],
      poolConfigurator,
      aclManager,
    })
    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    await expect(getBorrowing(weth)).resolves.toBe(true)
    await expect(getBorrowing(usdt)).resolves.toBe(false)
  })

  test('execute enable borrowing 2 assets', async () => {
    subAction = new SetReserveBorrowingSubAction(client, {
      reserveBorrowingInfos: [
        {
          asset: weth,
          enabled: true,
        },
        {
          asset: usdt,
          enabled: true,
        },
      ],
      poolConfigurator,
      aclManager,
    })
    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    await expect(getBorrowing(weth)).resolves.toBe(true)
    await expect(getBorrowing(usdt)).resolves.toBe(true)
  })

  async function getBorrowing(asset: Address): Promise<boolean> {
    const poolArtifact = await readArtifact('Pool')
    const reserveData: any = await client.publicClient.readContract({
      address: pool,
      abi: poolArtifact.abi,
      functionName: 'getReserveData',
      args: [asset],
    })
    const config = reserveData.configuration.data
    const BORROWING_MASK = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFBFFFFFFFFFFFFFFn; // prettier-ignore
    return (config & ~BORROWING_MASK) !== 0n
  }
})
