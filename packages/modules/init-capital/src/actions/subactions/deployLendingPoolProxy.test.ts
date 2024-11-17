import { beforeAll, describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupInitCapital } from '@actions/__mock__/setup'
import {
  DeployLendingPoolProxySubAction,
  DeployLendingPoolProxySubActionParams,
  DeployLendingPoolSubActionMsg,
} from '@actions/subactions/deployLendingPoolProxy'

import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployLendingPoolProxySubAction', () => {
  let registry: InitCapitalRegistry
  const tester = ARBITRUM_TEST_ADDRESSES.tester
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  let result: SubActionExecuteResponse<InitCapitalRegistry, DeployLendingPoolSubActionMsg>

  beforeAll(async () => {
    registry = await setupInitCapital()
    expect(registry.proxyAdmin).not.to.equal(zeroAddress)
    expect(registry.lendingPoolImpl).not.to.equal(zeroAddress)
    const params: DeployLendingPoolProxySubActionParams = {
      name: 'testLendingPool',
      proxyAdmin: registry.proxyAdmin!,
      lendingPoolImpl: registry.lendingPoolImpl!,
    }
    const subAction = new DeployLendingPoolProxySubAction(client, params)
    const callback = vi.fn()
    result = await subAction.execute(registry, {}, callback)
  })

  test('lendingPool registry should not be zero address', async () => {
    const registryLendingPools = result.newRegistry.lendingPools!
    // check no zero address
    expect(registryLendingPools.testLendingPool).not.to.equal(zeroAddress)
  })

  test('lendingPool message should not be zero address', async () => {
    const messageLendingPool = result.newMessage!.lendingPoolProxy!
    // check no zero address
    expect(messageLendingPool).not.to.equal(zeroAddress)
  })
})
