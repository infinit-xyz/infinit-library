import { beforeAll, describe, expect, test, vi } from 'vitest'

import { Address } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  DeployPendleLimitRouterProxyMsg,
  DeployPendleLimitRouterProxySubAction,
} from '@actions/on-chain/subactions/deployPendleLimitRouterProxy'

import { DeployPendleLimitRouterSubAction } from './deployPendleLimitRouter'
import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleLimitRouterProxySubAction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleLimitRouterProxySubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleLimitRouterProxyMsg>
  let pendleLimitRouterImpl: Address
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    const deployLimitRouterSubAction = new DeployPendleLimitRouterSubAction(client, {
      wrappedNativeToken: '0x0000000000000000000000000000000000000002',
    })
    const deployLimitRouterResult = await deployLimitRouterSubAction.execute(registry, {}, callback)
    pendleLimitRouterImpl = deployLimitRouterResult.newMessage!.pendleLimitRouter
    subAction = new DeployPendleLimitRouterProxySubAction(client, {
      proxyAdmin: '0x0000000000000000000000000000000000000002',
      pendleLimitRouterImpl: pendleLimitRouterImpl,
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleLimitRouterProxySubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      proxyAdmin: '0x0000000000000000000000000000000000000002',
      pendleLimitRouterImpl: pendleLimitRouterImpl,
    })
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('registry should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendleLimitRouterImpl = result.newRegistry.pendleLimitRouterImpl!
    // check not undefined address
    expect(pendleLimitRouterImpl).not.toBeUndefined()
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const messagePendleLimitRouterImpl = result.newRegistry.pendleLimitRouterImpl!
    // check messages
    expect(messagePendleLimitRouterImpl).not.toBeUndefined()
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registrypendleLimitRouterImpl = result.newRegistry.pendleLimitRouterProxy
    const messagePendleLimitRouterImpl = result.newMessage!.pendleLimitRouterProxy
    // registry and message addresses should be matched
    expect(registrypendleLimitRouterImpl === messagePendleLimitRouterImpl).toBeTruthy()
  })
})
