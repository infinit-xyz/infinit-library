import { beforeAll, describe, expect, test, vi } from 'vitest'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleRouterV4Msg, DeployPendleRouterV4SubAction } from '@actions/on-chain/subactions/deployPendleRouterV4'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleRouterV4SubAction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleRouterV4SubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleRouterV4Msg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployPendleRouterV4SubAction(client, {
      owner: '0x0000000000000000000000000000000000000002',
      routerStorageV4: '0x0000000000000000000000000000000000000003',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleRouterV4SubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      owner: '0x0000000000000000000000000000000000000002',
      routerStorageV4: '0x0000000000000000000000000000000000000003',
    })
  })

  test('validate should be success', async () => {
    vi.spyOn(subAction.txBuilders[0], 'validate').mockImplementation(async () => {})
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('validate should be failed', async () => {
    vi.spyOn(subAction.txBuilders[0], 'validate').mockImplementation(async () => {
      throw new Error('validate failed')
    })
    await expect(subAction.validate()).rejects.toThrowError('validate failed')
  })

  test('registry should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendleRouterV4 = result.newRegistry.pendleRouterV4!
    // check not undefined address
    expect(pendleRouterV4).not.toBeUndefined()
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendleRouterV4 = result.newMessage!.pendleRouterV4
    // check messages
    expect(pendleRouterV4).not.toBeUndefined()
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleRouterV4 = result.newRegistry.pendleRouterV4
    const messagePendleRouterV4 = result.newMessage!.pendleRouterV4
    // registry and message addresses should be matched
    expect(registryPendleRouterV4 === messagePendleRouterV4).toBeTruthy()
  })
})
