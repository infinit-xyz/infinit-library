import { beforeAll, describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendleBoringOneracleMsg, DeployPendleBoringOneracleSubAction } from '@actions/on-chain/subactions/deployPendleBoringOneracle'

import { PendleV3Registry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleBoringOneracleSubAction', () => {
  const registry: PendleV3Registry = {}
  let subAction: DeployPendleBoringOneracleSubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleV3Registry, DeployPendleBoringOneracleMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployPendleBoringOneracleSubAction(client, {})
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleBoringOneracleSubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({})
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('registry should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleBoringOneracle = result.newRegistry.pendleBoringOneracle!
    // check no zero address
    expect(registryPendleBoringOneracle).not.to.equal(zeroAddress)
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const messagePendleBoringOneracle = result.newRegistry.pendleBoringOneracle!
    // check messages
    expect(messagePendleBoringOneracle).not.to.equal(zeroAddress)
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleBoringOneracle = result.newRegistry.pendleBoringOneracle!
    const messagePendleBoringOneracle = result.newRegistry.pendleBoringOneracle!
    // registry and message addresses should be matched
    expect(registryPendleBoringOneracle, messagePendleBoringOneracle).toBeTruthy()
  })
})
