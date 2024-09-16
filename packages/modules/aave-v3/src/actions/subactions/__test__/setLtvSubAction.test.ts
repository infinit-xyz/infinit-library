import { beforeAll, describe, expect, test } from 'vitest'

import { Address } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupAaveV3 } from '@actions/__mock__/setup'
import { SetLtvSubAction } from '@actions/subactions/setLtvSubAction'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('SetLtvSubAction', () => {
  let subAction: SetLtvSubAction
  let client: TestInfinitWallet
  let pool: Address
  let poolConfigurator: Address
  let aclManager: Address
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const usdt = ARBITRUM_TEST_ADDRESSES.usdt
  const ethLtv = 8000n
  const usdtLtv = 7000n

  let registry: AaveV3Registry

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, ARBITRUM_TEST_ADDRESSES.tester)
    registry = await setupAaveV3()
    pool = registry.poolProxy!
    poolConfigurator = registry.poolConfiguratorProxy!
    aclManager = registry.aclManager!
  })

  test('validate throw error', async () => {
    subAction = new SetLtvSubAction(client, {
      ltvInfos: [
        {
          asset: weth,
          ltv: 9999n,
        },
      ],
      pool,
      poolConfigurator,
      aclManager,
    })
    await expect(subAction.validate()).rejects.toThrowError()
  })

  test('validate success', async () => {
    subAction = new SetLtvSubAction(client, {
      ltvInfos: [
        {
          asset: weth,
          ltv: ethLtv,
        },
      ],
      pool,
      poolConfigurator,
      aclManager,
    })
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('execute set 1 asset', async () => {
    subAction = new SetLtvSubAction(client, {
      ltvInfos: [
        {
          asset: weth,
          ltv: ethLtv,
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
  })

  test('execute set 2 assets', async () => {
    subAction = new SetLtvSubAction(client, {
      ltvInfos: [
        {
          asset: weth,
          ltv: ethLtv,
        },
        {
          asset: usdt,
          ltv: usdtLtv,
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
    expect(usdtLtv).toBe(await getLtv(usdt))
  })

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
