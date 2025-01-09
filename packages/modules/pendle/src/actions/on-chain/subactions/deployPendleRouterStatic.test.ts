import { beforeAll, describe, expect, test, vi } from 'vitest'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleRouterStaticMsg, DeployPendleRouterStaticSubAction } from '@actions/on-chain/subactions/deployPendleRouterStatic'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleMarketFactoryV3', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleRouterStaticSubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleRouterStaticMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployPendleRouterStaticSubAction(client, {
      actionStorageStatic: '0x0000000000000000000000000000000000000002',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleRouterStaticSubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      actionStorageStatic: '0x0000000000000000000000000000000000000002',
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
    const pendleRouterStatic = result.newRegistry.pendleRouterStatic!
    // check not undefined address
    expect(pendleRouterStatic).not.toBeUndefined()
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendleRouterStatic = result.newMessage!.pendleRouterStatic
    // check messages
    expect(pendleRouterStatic).not.toBeUndefined()
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleRouterStatic = result.newRegistry.pendleRouterStatic
    const messagePendleRouterStatic = result.newMessage!.pendleRouterStatic
    // registry and message addresses should be matched
    expect(registryPendleRouterStatic === messagePendleRouterStatic).toBeTruthy()
  })
})
