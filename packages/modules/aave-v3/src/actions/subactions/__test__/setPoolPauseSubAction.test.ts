import { beforeAll, describe, expect, test } from 'vitest'

import { Address } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupAaveV3 } from '@actions/__mock__/setup'
import { SetPoolPauseSubAction } from '@actions/subactions/setPoolPauseSubAction'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('SetPoolPauseSubAction', () => {
  let subAction: SetPoolPauseSubAction
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

  test('execute pause pool', async () => {
    subAction = new SetPoolPauseSubAction(client, {
      poolConfigurator,
      aclManager,
      paused: true,
    })

    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    expect(getPause(weth)).resolves.toBe(true)
    expect(getPause(usdt)).resolves.toBe(true)
  })

  test('execute unpause pool', async () => {
    // pause first
    subAction = new SetPoolPauseSubAction(client, {
      poolConfigurator,
      aclManager,
      paused: true,
    })

    await subAction.execute(registry, {})
    await expect(getPause(weth)).resolves.toBe(true)
    await expect(getPause(usdt)).resolves.toBe(true)

    subAction = new SetPoolPauseSubAction(client, {
      poolConfigurator,
      aclManager,
      paused: false,
    })
    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})

    await expect(getPause(weth)).resolves.toBe(false)
    await expect(getPause(usdt)).resolves.toBe(false)
  })

  async function getPause(asset: Address): Promise<boolean> {
    const poolArtifact = await readArtifact('Pool')
    const reserveData: any = await client.publicClient.readContract({
      address: pool,
      abi: poolArtifact.abi,
      functionName: 'getReserveData',
      args: [asset],
    })
    const config = reserveData.configuration.data
    const PAUSED_MASK = 0xffffffffffffffffffffffffffffffffffffffffffffffffefffffffffffffffn
    return (config & ~PAUSED_MASK) !== 0n
  }
})
