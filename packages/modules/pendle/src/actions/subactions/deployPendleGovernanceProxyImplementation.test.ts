import { beforeAll, describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  DeployPendleGovernanceProxyImplMsg,
  DeployPendleGovernanceProxyImplementationSubAction,
} from '@actions/subactions/deployPendleGovernanceProxyImplementation'

import { PendleV3Registry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleGovernanceProxyImplementationSubAction', () => {
  const registry: PendleV3Registry = {}
  let subAction: DeployPendleGovernanceProxyImplementationSubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleV3Registry, DeployPendleGovernanceProxyImplMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployPendleGovernanceProxyImplementationSubAction(client, {})
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleGovernanceProxyImplementationSubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({})
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('registry should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendleGovernanceProxyImpl = result.newRegistry.pendleGovernanceProxyImpl!
    // check no zero address
    expect(pendleGovernanceProxyImpl).not.to.equal(zeroAddress)
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const messagePendleGovernanceProxyImpl = result.newRegistry.pendleGovernanceProxyImpl!
    // check messages
    expect(messagePendleGovernanceProxyImpl).not.to.equal(zeroAddress)
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleGovernanceProxyImpl = result.newRegistry.pendleGovernanceProxyImpl!
    const messagePendleGovernanceProxyImpl = result.newMessage!.pendleGovernanceProxyImpl!
    // registry and message addresses should be matched
    expect(registryPendleGovernanceProxyImpl, messagePendleGovernanceProxyImpl).toBeTruthy()
  })
})
