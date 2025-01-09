import { beforeAll, describe, expect, test, vi } from 'vitest'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleSwapSubAction, DeployPendleSwapSubActionMsg } from '@actions/on-chain/subactions/deployPendleSwap'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleMarketFactoryV3', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleSwapSubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleSwapSubActionMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployPendleSwapSubAction(client)
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleSwapSubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({})
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
    const pendleSwap = result.newRegistry.pendleSwap!
    // check not undefined address
    expect(pendleSwap).not.toBeUndefined()
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendleSwap = result.newMessage!.pendleSwap
    // check messages
    expect(pendleSwap).not.toBeUndefined()
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleSwap = result.newRegistry.pendleSwap
    const messagePendleSwap = result.newMessage!.pendleSwap
    // registry and message addresses should be matched
    expect(registryPendleSwap === messagePendleSwap).toBeTruthy()
  })
})
