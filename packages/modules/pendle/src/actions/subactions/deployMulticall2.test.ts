import { beforeAll, describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployMulticall2Msg, DeployMulticall2SubAction } from '@actions/subactions/deployMulticall2'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployMulticall2SubAction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployMulticall2SubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployMulticall2Msg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployMulticall2SubAction(client, {})
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployMulticall2SubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({})
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('registry should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const multicall = result.newRegistry.multicall!
    // check no zero address
    expect(multicall).not.to.equal(zeroAddress)
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const messagePendleBoringOneracle = result.newRegistry.multicall!
    // check messages
    expect(messagePendleBoringOneracle).not.to.equal(zeroAddress)
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const multicall = result.newRegistry.multicall!
    const messagePendleBoringOneracle = result.newMessage!.multicall!
    // registry and message addresses should be matched
    expect(multicall, messagePendleBoringOneracle).toBeTruthy()
  })
})
