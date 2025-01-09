import { beforeAll, describe, expect, test, vi } from 'vitest'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleStaticFacetsMsg, DeployPendleStaticFacetsSubAction } from '@actions/on-chain/subactions/deployRouterStaticFacets'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleMarketFactoryV3', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleStaticFacetsSubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleStaticFacetsMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployPendleStaticFacetsSubAction(client, {
      owner: '0x0000000000000000000000000000000000000002',
      vePendle: '0x0000000000000000000000000000000000000003',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleStaticFacetsSubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      owner: '0x0000000000000000000000000000000000000002',
      vePendle: '0x0000000000000000000000000000000000000003',
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
    const actionStorageStatic = result.newRegistry!.actionStorageStatic
    const actionInfoStatic = result.newRegistry!.actionInfoStatic!
    const actionMarketAuxStatic = result.newRegistry!.actionMarketAuxStatic!
    const actionMarketCoreStatic = result.newRegistry!.actionMarketCoreStatic!
    const actionMintRedeemStatic = result.newRegistry!.actionMintRedeemStatic!
    const actionVePendleStatic = result.newRegistry!.actionVePendleStatic!

    // check not undefined address
    expect(actionStorageStatic).not.toBeUndefined()
    expect(actionInfoStatic).not.toBeUndefined()
    expect(actionMarketAuxStatic).not.toBeUndefined()
    expect(actionMarketCoreStatic).not.toBeUndefined()
    expect(actionMintRedeemStatic).not.toBeUndefined()
    expect(actionVePendleStatic).not.toBeUndefined()
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const actionStorageStatic = result.newMessage!.actionStorageStatic
    const actionInfoStatic = result.newMessage!.actionInfoStatic!
    const actionMarketAuxStatic = result.newMessage!.actionMarketAuxStatic!
    const actionMarketCoreStatic = result.newMessage!.actionMarketCoreStatic!
    const actionMintRedeemStatic = result.newMessage!.actionMintRedeemStatic!
    const actionVePendleStatic = result.newMessage!.actionVePendleStatic!

    // check not undefined address
    expect(actionStorageStatic).not.toBeUndefined()
    expect(actionInfoStatic).not.toBeUndefined()
    expect(actionMarketAuxStatic).not.toBeUndefined()
    expect(actionMarketCoreStatic).not.toBeUndefined()
    expect(actionMintRedeemStatic).not.toBeUndefined()
    expect(actionVePendleStatic).not.toBeUndefined()
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const actionStorageStaticReg = result.newRegistry!.actionStorageStatic
    const actionInfoStaticReg = result.newRegistry!.actionInfoStatic!
    const actionMarketAuxStaticReg = result.newRegistry!.actionMarketAuxStatic!
    const actionMarketCoreStaticReg = result.newRegistry!.actionMarketCoreStatic!
    const actionMintRedeemStaticReg = result.newRegistry!.actionMintRedeemStatic!
    const actionVePendleStaticReg = result.newRegistry!.actionVePendleStatic!

    const actionStorageStaticMsg = result.newMessage!.actionStorageStatic
    const actionInfoStaticMsg = result.newMessage!.actionInfoStatic!
    const actionMarketAuxStaticMsg = result.newMessage!.actionMarketAuxStatic!
    const actionMarketCoreStaticMsg = result.newMessage!.actionMarketCoreStatic!
    const actionMintRedeemStaticMsg = result.newMessage!.actionMintRedeemStatic!
    const actionVePendleStaticMsg = result.newMessage!.actionVePendleStatic!

    // registry and message addresses should be matched
    expect(actionStorageStaticReg === actionStorageStaticMsg).toBeTruthy()
    expect(actionInfoStaticReg === actionInfoStaticMsg).toBeTruthy()
    expect(actionMarketAuxStaticReg === actionMarketAuxStaticMsg).toBeTruthy()
    expect(actionMarketCoreStaticReg === actionMarketCoreStaticMsg).toBeTruthy()
    expect(actionMintRedeemStaticReg === actionMintRedeemStaticMsg).toBeTruthy()
    expect(actionVePendleStaticReg === actionVePendleStaticMsg).toBeTruthy()
  })
})
