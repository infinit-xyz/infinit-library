import { beforeAll, describe, expect, test, vi } from 'vitest'

import { Address } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  DeployPendleMsgSendEndpointUpgProxySubaction,
  DeployPendleMsgSendEndpointUpgProxySubactionMsg,
} from '@actions/on-chain/subactions/deployPendleMsgSendEndpointUpgProxy'

import { DeployPendleMsgSendEndpointUpgSubaction } from './deployPendleMsgSendEndpointUpg'
import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleMsgSendEndpointUpgProxySubaction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleMsgSendEndpointUpgProxySubaction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleMsgSendEndpointUpgProxySubactionMsg>
  let pendleMsgSendEndpointImpl: Address
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    const deployPendleMsgSendEndpointSubAction = new DeployPendleMsgSendEndpointUpgSubaction(client, {
      refundAddress: '0x0000000000000000000000000000000000000002',
      lzEndpoint: '0x0000000000000000000000000000000000000003',
    })
    const deployMsgSendPointResult = await deployPendleMsgSendEndpointSubAction.execute(registry, {}, callback)
    pendleMsgSendEndpointImpl = deployMsgSendPointResult.newMessage!.pendleMsgSendEndpointUpg
    subAction = new DeployPendleMsgSendEndpointUpgProxySubaction(client, {
      implementation: pendleMsgSendEndpointImpl,
      data: '0x',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleMsgSendEndpointUpgProxySubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      implementation: pendleMsgSendEndpointImpl,
      data: '0x',
    })
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('registry should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendleMsgSendEndpointProxy = result.newRegistry.pendleMsgSendEndpointUpgProxy!
    // check not undefined address
    expect(pendleMsgSendEndpointProxy).not.toBeUndefined()
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const messagependleMsgSendEndpointProxy = result.newRegistry.pendleMsgSendEndpointUpgProxy
    // check messages
    expect(messagependleMsgSendEndpointProxy).not.toBeUndefined()
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registrypendleMsgSendEndpointProxy = result.newRegistry.pendleMsgSendEndpointUpgProxy
    const messagependleMsgSendEndpointProxy = result.newMessage!.pendleMsgSendEndpointUpgProxy
    // registry and message addresses should be matched
    expect(registrypendleMsgSendEndpointProxy === messagependleMsgSendEndpointProxy).toBeTruthy()
  })
})
