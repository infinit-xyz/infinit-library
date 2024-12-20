import { beforeAll, describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  DeployPendlePoolDeployHelperMsg,
  DeployPendlePoolDeployHelperSubAction,
  DeployPendlePoolDeployHelperSubActionParams,
} from '@actions/on-chain/subactions/deployPendlePoolDeployHelper'

import { PendleV3Registry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendlePoolDeployHelperSubAction', () => {
  const registry: PendleV3Registry = {}
  let subAction: DeployPendlePoolDeployHelperSubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleV3Registry, DeployPendlePoolDeployHelperMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester
  const params: DeployPendlePoolDeployHelperSubActionParams = {
    router: '0x0000000000000000000000000000000000000001',
    yieldContractFactory: '0x0000000000000000000000000000000000000002',
    marketFactory: '0x0000000000000000000000000000000000000003',
  }

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployPendlePoolDeployHelperSubAction(client, params)
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendlePoolDeployHelperSubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual(params)
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('registry should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendlePoolDeployHelper = result.newRegistry.pendlePoolDeployHelper!
    // check no zero address
    expect(pendlePoolDeployHelper).not.to.equal(zeroAddress)
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const messagePendleMulticallV2 = result.newRegistry.pendlePoolDeployHelper!
    // check messages
    expect(messagePendleMulticallV2).not.to.equal(zeroAddress)
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleMulticallV2 = result.newRegistry.pendlePoolDeployHelper!
    const messagePendleMulticallV2 = result.newMessage!.pendlePoolDeployHelper!
    // registry and message addresses should be matched
    expect(registryPendleMulticallV2, messagePendleMulticallV2).toBeTruthy()
  })
})
