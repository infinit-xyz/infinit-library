import { beforeAll, describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  DeployProxyPendleGovernanceProxyMsg,
  DeployProxyPendleGovernanceProxySubAction,
  DeployProxyPendleGovernanceProxySubActionParams,
} from '@actions/subactions/deployProxyPendleGovernanceProxy'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployProxyPendleGovernanceProxySubAction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployProxyPendleGovernanceProxySubAction
  let client: TestInfinitWallet
  const tester = ARBITRUM_TEST_ADDRESSES.tester
  let result: SubActionExecuteResponse<PendleRegistry, DeployProxyPendleGovernanceProxyMsg>
  const callback = vi.fn()

  // note: use any implementation address that is a contract to avoid revert
  const params: DeployProxyPendleGovernanceProxySubActionParams = {
    implementation: ARBITRUM_TEST_ADDRESSES.weth,
  }

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployProxyPendleGovernanceProxySubAction(client, params)
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployProxyPendleGovernanceProxySubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual(params)
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('registry should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendleGovernanceProxy = result.newRegistry.pendleGovernanceProxy!
    // check no zero address
    expect(pendleGovernanceProxy).not.to.equal(zeroAddress)
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendleGovernanceProxy = result.newRegistry.pendleGovernanceProxy!
    // check messages
    expect(pendleGovernanceProxy).not.to.equal(zeroAddress)
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleGovernanceProxy = result.newRegistry.pendleGovernanceProxy!
    const messagePendleGovernanceProxy = result.newMessage!.pendleGovernanceProxy!
    // registry and message addresses should be matched
    expect(registryPendleGovernanceProxy, messagePendleGovernanceProxy).toBeTruthy()
  })
})
