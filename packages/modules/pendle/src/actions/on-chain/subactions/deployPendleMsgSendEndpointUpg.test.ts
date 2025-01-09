import { beforeAll, describe, expect, test, vi } from 'vitest'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  DeployPendleMsgSendEndpointUpgSubaction,
  DeployPendleMsgSendEndpointUpgSubactionMsg,
} from '@actions/on-chain/subactions/deployPendleMsgSendEndpointUpg'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleMarketFactoryV3', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleMsgSendEndpointUpgSubaction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleMsgSendEndpointUpgSubactionMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployPendleMsgSendEndpointUpgSubaction(client, {
      refundAddress: '0x0000000000000000000000000000000000000002',
      lzEndpoint: '0x0000000000000000000000000000000000000003',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleMsgSendEndpointUpgSubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      refundAddress: '0x0000000000000000000000000000000000000002',
      lzEndpoint: '0x0000000000000000000000000000000000000003',
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
    const pendleMsgSendEndpointUpgImpl = result.newRegistry.pendleMsgSendEndpointUpgImpl!
    // check not undefined address
    expect(pendleMsgSendEndpointUpgImpl).not.toBeUndefined()
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendleMsgSendEndpointUpgImpl = result.newMessage!.pendleMsgSendEndpointUpg
    // check messages
    expect(pendleMsgSendEndpointUpgImpl).not.toBeUndefined()
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleMsgSendEndpointUpgImpl = result.newRegistry.pendleMsgSendEndpointUpgImpl
    const messagePendleMsgSendEndpointUpgImpl = result.newMessage!.pendleMsgSendEndpointUpg
    // registry and message addresses should be matched
    expect(registryPendleMsgSendEndpointUpgImpl === messagePendleMsgSendEndpointUpgImpl).toBeTruthy()
  })
})
