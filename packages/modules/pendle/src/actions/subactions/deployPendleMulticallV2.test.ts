import { beforeAll, describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployPendleMulticallV2Msg, DeployPendleMulticallV2SubAction } from '@actions/subactions/deployPendleMulticallV2'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleMulticallV2SubAction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleMulticallV2SubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleMulticallV2Msg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployPendleMulticallV2SubAction(client, {})
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleMulticallV2SubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({})
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('registry should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendleMulticallV2 = result.newRegistry.pendleMulticallV2!
    // check no zero address
    expect(pendleMulticallV2).not.to.equal(zeroAddress)
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const messagePendleMulticallV2 = result.newRegistry.pendleMulticallV2!
    // check messages
    expect(messagePendleMulticallV2).not.to.equal(zeroAddress)
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleMulticallV2 = result.newRegistry.pendleMulticallV2!
    const messagePendleMulticallV2 = result.newMessage!.pendleMulticallV2!
    // registry and message addresses should be matched
    expect(registryPendleMulticallV2, messagePendleMulticallV2).toBeTruthy()
  })
})
