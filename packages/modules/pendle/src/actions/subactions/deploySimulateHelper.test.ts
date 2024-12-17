import { beforeAll, describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeploySimulateHelperMsg, DeploySimulateHelperSubAction } from '@actions/subactions/deploySimulateHelper'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeploySimulateHelperSubAction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeploySimulateHelperSubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeploySimulateHelperMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeploySimulateHelperSubAction(client, {})
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeploySimulateHelperSubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({})
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('registry should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const simulateHelper = result.newRegistry.simulateHelper!
    // check no zero address
    expect(simulateHelper).not.to.equal(zeroAddress)
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const messageSimulateHelper = result.newRegistry.simulateHelper!
    // check messages
    expect(messageSimulateHelper).not.to.equal(zeroAddress)
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registrySimulateHelper = result.newRegistry.simulateHelper!
    const messageSimulateHelper = result.newMessage!.simulateHelper!
    // registry and message addresses should be matched
    expect(registrySimulateHelper, messageSimulateHelper).toBeTruthy()
  })
})
