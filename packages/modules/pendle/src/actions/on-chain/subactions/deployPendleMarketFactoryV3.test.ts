import { beforeAll, describe, expect, test, vi } from 'vitest'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  DeployPendleMarketFactoryV3Subaction,
  DeployPendleMarketFactoryV3SubactionMsg,
} from '@actions/on-chain/subactions/deployPendleMarketFactoryV3'

import { DeployPendleLimitRouterSubAction } from './deployPendleLimitRouter'
import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleMarketFactoryV3', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleMarketFactoryV3Subaction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleMarketFactoryV3SubactionMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    const deployLimitRouterSubAction = new DeployPendleLimitRouterSubAction(client, {
      wrappedNativeToken: '0x0000000000000000000000000000000000000002',
    })
    subAction = new DeployPendleMarketFactoryV3Subaction(client, {
      yieldContractFactory: '0x0000000000000000000000000000000000000002',
      marketCreationCodeContractA: '0x0000000000000000000000000000000000000003',
      marketCreationCodeSizeA: 100n,
      marketCreationCodeContractB: '0x0000000000000000000000000000000000000004',
      marketCreationCodeSizeB: 101n,
      treasury: '0x0000000000000000000000000000000000000005',
      reserveFeePercent: 20,
      vePendle: '0x0000000000000000000000000000000000000006',
      guaugeController: '0x0000000000000000000000000000000000000007',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleMarketFactoryV3Subaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      yieldContractFactory: '0x0000000000000000000000000000000000000002',
      marketCreationCodeContractA: '0x0000000000000000000000000000000000000003',
      marketCreationCodeSizeA: 100n,
      marketCreationCodeContractB: '0x0000000000000000000000000000000000000004',
      marketCreationCodeSizeB: 101n,
      treasury: '0x0000000000000000000000000000000000000005',
      reserveFeePercent: 20,
      vePendle: '0x0000000000000000000000000000000000000006',
      guaugeController: '0x0000000000000000000000000000000000000007',
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
    const pendleMarketFactoryV3 = result.newRegistry.pendleMarketFactoryV3!
    // check not undefined address
    expect(pendleMarketFactoryV3).not.toBeUndefined()
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const messagependleMarketFactoryV3 = result.newRegistry.pendleMarketFactoryV3!
    // check messages
    expect(messagependleMarketFactoryV3).not.toBeUndefined()
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleMarketFactoryV3 = result.newRegistry.pendleMarketFactoryV3
    const messagePendleMarketFactoryV3 = result.newMessage!.pendleMarketFactoryV3
    // registry and message addresses should be matched
    expect(registryPendleMarketFactoryV3 === messagePendleMarketFactoryV3).toBeTruthy()
  })
})
