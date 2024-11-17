import { beforeAll, describe, expect, test, vi } from 'vitest'

import { parseUnits, zeroAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupInitCapitalAndPools } from '@actions/__mock__/setup'
import { DeployLendingPoolProxySubAction } from '@actions/subactions/deployLendingPoolProxy'
import { InitializeLendingPoolSubAction } from '@actions/subactions/initializePool'

import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('InitalizePool', () => {
  let registry: InitCapitalRegistry
  const tester = ARBITRUM_TEST_ADDRESSES.tester
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  beforeAll(async () => {
    registry = await setupInitCapitalAndPools()
    expect(registry.proxyAdmin).not.to.equal(zeroAddress)
    expect(registry.lendingPoolImpl).not.to.equal(zeroAddress)
    // deploy new pool
    const subAction = new DeployLendingPoolProxySubAction(client, {
      name: 'testLendingPool',
      proxyAdmin: registry.proxyAdmin!,
      lendingPoolImpl: registry.lendingPoolImpl!,
    })
    const result = await subAction.execute(registry, {}, vi.fn())
    registry = result.newRegistry
  })

  test('lendingPool registry should valid', async () => {
    expect(registry.lendingPools?.testLendingPool.lendingPool).not.to.equal(zeroAddress)
    expect(registry.irms?.testIRM).not.to.equal(zeroAddress)
    const lendingPoolAddressBefore = registry.lendingPools!.testLendingPool.lendingPool
    // initilaize pool
    const subAction = new InitializeLendingPoolSubAction(client, {
      name: 'testLendingPool',
      lendingPool: registry.lendingPools!.testLendingPool.lendingPool,
      underlingToken: ARBITRUM_TEST_ADDRESSES.weth,
      symbol: 'WETH',
      irm: registry.irms!.testIRM,
      reserveFactor: parseUnits('0.1', 18),
      treasury: '0x0000000000000000000000000000000000000001',
    })
    const result = await subAction.execute(registry, {}, vi.fn())
    registry = result.newRegistry
    expect(registry.lendingPools!.testLendingPool).toBeDefined()
    const registryLendingPool = registry.lendingPools!.testLendingPool

    // validate
    expect(registryLendingPool.lendingPool === lendingPoolAddressBefore).toBeTruthy()
    expect(registryLendingPool.underlyingToken === ARBITRUM_TEST_ADDRESSES.weth).toBeTruthy()
    expect(registryLendingPool.irm === registry.irms!.testIRM).toBeTruthy()
  })
})
