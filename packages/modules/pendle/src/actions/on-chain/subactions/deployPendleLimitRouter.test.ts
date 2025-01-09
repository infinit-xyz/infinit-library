import { beforeAll, describe, expect, test, vi } from 'vitest'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleLimitRouterMsg, DeployPendleLimitRouterSubAction } from '@actions/on-chain/subactions/deployPendleLimitRouter'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleLimitRouterSubAction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleLimitRouterSubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleLimitRouterMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployPendleLimitRouterSubAction(client, { wrappedNativeToken: '0x0000000000000000000000000000000000000002' })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleLimitRouterSubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({ wrappedNativeToken: '0x0000000000000000000000000000000000000002' })
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
    const registrypendleLimitRouterImpl = result.newRegistry.pendleLimitRouterImpl!
    const messagePendleLimitRouterImpl = result.newMessage!.pendleLimitRouter
    // registry and message addresses should be matched
    expect(registrypendleLimitRouterImpl === messagePendleLimitRouterImpl).toBeTruthy()
  })
})
