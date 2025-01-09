import { beforeAll, describe, expect, test, vi } from 'vitest'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleRouterFacetsMsg, DeployPendleRouterFacetsSubAction } from '@actions/on-chain/subactions/deployRouterFacets'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleMarketFactoryV3', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleRouterFacetsSubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleRouterFacetsMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployPendleRouterFacetsSubAction(client, {})
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleRouterFacetsSubAction')
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
    const routerStorageV4 = result.newRegistry.routerStorageV4!
    const actionAddRemoveLiqV3 = result.newRegistry.actionAddRemoveLiqV3!
    const actionCallbackV3 = result.newRegistry.actionCallbackV3!
    const actionMiscV3 = result.newRegistry.actionMiscV3!
    const actionSimple = result.newRegistry.actionSimple!
    const actionSwapPTV3 = result.newRegistry.actionSwapPTV3!
    const actionSwapYTV3 = result.newRegistry.actionSwapYTV3!
    // check not undefined address
    expect(routerStorageV4).not.toBeUndefined()
    expect(actionAddRemoveLiqV3).not.toBeUndefined()
    expect(actionCallbackV3).not.toBeUndefined()
    expect(actionMiscV3).not.toBeUndefined()
    expect(actionSimple).not.toBeUndefined()
    expect(actionSwapPTV3).not.toBeUndefined()
    expect(actionSwapYTV3).not.toBeUndefined()
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const routerStorageV4 = result.newMessage!.routerStorageV4
    const actionAddRemoveLiqV3 = result.newMessage!.actionAddRemoveLiqV3!
    const actionCallbackV3 = result.newMessage!.actionCallbackV3!
    const actionMiscV3 = result.newMessage!.actionMiscV3!
    const actionSimple = result.newMessage!.actionSimple!
    const actionSwapPTV3 = result.newMessage!.actionSwapPTV3!
    const actionSwapYTV3 = result.newMessage!.actionSwapYTV3!
    // check not undefined address
    expect(routerStorageV4).not.toBeUndefined()
    expect(actionAddRemoveLiqV3).not.toBeUndefined()
    expect(actionCallbackV3).not.toBeUndefined()
    expect(actionMiscV3).not.toBeUndefined()
    expect(actionSimple).not.toBeUndefined()
    expect(actionSwapPTV3).not.toBeUndefined()
    expect(actionSwapYTV3).not.toBeUndefined()
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const routerStorageV4Reg = result.newRegistry.routerStorageV4!
    const actionAddRemoveLiqV3Reg = result.newRegistry.actionAddRemoveLiqV3!
    const actionCallbackV3Reg = result.newRegistry.actionCallbackV3!
    const actionMiscV3Reg = result.newRegistry.actionMiscV3!
    const actionSimpleReg = result.newRegistry.actionSimple!
    const actionSwapPTV3Reg = result.newRegistry.actionSwapPTV3!
    const actionSwapYTV3Reg = result.newRegistry.actionSwapYTV3!

    const routerStorageV4Msg = result.newMessage!.routerStorageV4
    const actionAddRemoveLiqV3Msg = result.newMessage!.actionAddRemoveLiqV3!
    const actionCallbackV3Msg = result.newMessage!.actionCallbackV3!
    const actionMiscV3Msg = result.newMessage!.actionMiscV3!
    const actionSimpleMsg = result.newMessage!.actionSimple!
    const actionSwapPTV3Msg = result.newMessage!.actionSwapPTV3!
    const actionSwapYTV3Msg = result.newMessage!.actionSwapYTV3!
    // registry and message addresses should be matched
    expect(routerStorageV4Reg === routerStorageV4Msg).toBeTruthy()
    expect(actionAddRemoveLiqV3Reg === actionAddRemoveLiqV3Msg).toBeTruthy()
    expect(actionCallbackV3Reg === actionCallbackV3Msg).toBeTruthy()
    expect(actionMiscV3Reg === actionMiscV3Msg).toBeTruthy()
    expect(actionSimpleReg === actionSimpleMsg).toBeTruthy()
    expect(actionSwapPTV3Reg === actionSwapPTV3Msg).toBeTruthy()
    expect(actionSwapYTV3Reg === actionSwapYTV3Msg).toBeTruthy()
  })
})
