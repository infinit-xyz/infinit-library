import { beforeAll, describe, expect, test, vi } from 'vitest'

import { Address, zeroAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupAaveV3 } from '@actions/__mock__/setup'
import { SetInterestRateStrategyAddressSubAction } from '@actions/subactions/setReserveInterestRateStrategyAddressSubAction'

import { getReserveData } from '../tx-builders/utils'
import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('SetInterestRateStrategyAddressSubAction', () => {
  let subAction: SetInterestRateStrategyAddressSubAction
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

  test('validate no lendingPools', async () => {
    subAction = new SetInterestRateStrategyAddressSubAction(client, {
      interestRateStrategyAddressInfos: [
        {
          asset: weth,
          interestRateStrategy: zeroAddress,
        },
      ],
      poolConfigurator,
      aclManager,
      pool,
    })
    await expect(subAction.validate({})).rejects.toThrowError('lendingPools not found in registry')
  })

  test('validate asset not found', async () => {
    subAction = new SetInterestRateStrategyAddressSubAction(client, {
      interestRateStrategyAddressInfos: [
        {
          asset: weth,
          interestRateStrategy: zeroAddress,
        },
      ],
      poolConfigurator,
      aclManager,
      pool,
    })
    const registryTest: AaveV3Registry = {
      lendingPools: {
        usdt: {
          underlyingToken: usdt,
          interestRateStrategy: zeroAddress,
          aToken: zeroAddress,
          stableDebtToken: zeroAddress,
          variableDebtToken: zeroAddress,
        },
      },
    }
    await expect(subAction.validate(registryTest)).rejects.toThrowError(
      'asset: 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1 not found in registry',
    )
  })

  test('execute set 1 interestRateStrategy', async () => {
    subAction = new SetInterestRateStrategyAddressSubAction(client, {
      interestRateStrategyAddressInfos: [
        {
          asset: weth,
          interestRateStrategy: zeroAddress,
        },
      ],
      poolConfigurator,
      aclManager,
      pool,
    })
    const callback = vi.fn()
    const result = await subAction.execute(registry, {}, callback)
    expect(result.newRegistry.lendingPools!['WETH'].interestRateStrategy).toBe(zeroAddress)
    expect(result.newMessage).toEqual({})

    await expect(getIRM(weth)).resolves.toBe(zeroAddress)
  })

  test('execute set 2 interestRateStrategies', async () => {
    subAction = new SetInterestRateStrategyAddressSubAction(client, {
      interestRateStrategyAddressInfos: [
        {
          asset: weth,
          interestRateStrategy: zeroAddress,
        },
        {
          asset: usdt,
          interestRateStrategy: zeroAddress,
        },
      ],
      poolConfigurator,
      aclManager,
      pool,
    })
    const callback = vi.fn()
    const result = await subAction.execute(registry, {}, callback)
    expect(result.newRegistry.lendingPools!['WETH'].interestRateStrategy).toBe(zeroAddress)
    expect(result.newRegistry.lendingPools!['USDT'].interestRateStrategy).toBe(zeroAddress)
    expect(result.newMessage).toEqual({})

    await expect(getIRM(weth)).resolves.toBe(zeroAddress)
    await expect(getIRM(usdt)).resolves.toBe(zeroAddress)
  })

  async function getIRM(asset: Address): Promise<Address> {
    const poolArtifact = await readArtifact('Pool')
    const reserveData: any = await getReserveData(client, poolArtifact, pool, asset)
    return reserveData.interestRateStrategyAddress
  }
})
