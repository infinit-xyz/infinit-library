import { beforeAll, describe, expect, test, vi } from 'vitest'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployProxyAdminMsg, DeployProxyAdminSubAction } from '@actions/on-chain/subactions/deployProxyAdmin'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployProxyAdminSubAction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployProxyAdminSubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployProxyAdminMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployProxyAdminSubAction(client, {})
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployProxyAdminSubAction')
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
    const proxyAdmin = result.newRegistry.proxyAdmin!
    // check not undefined address
    expect(proxyAdmin).not.toBeUndefined()
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const proxyAdmin = result.newMessage!.proxyAdmin
    // check messages
    expect(proxyAdmin).not.toBeUndefined()
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryProxyAdmin = result.newRegistry.proxyAdmin
    const messageProxyAdmin = result.newMessage!.proxyAdmin
    // registry and message addresses should be matched
    expect(registryProxyAdmin === messageProxyAdmin).toBeTruthy()
  })
})
