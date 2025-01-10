import { beforeAll, describe, expect, test, vi } from 'vitest'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  DeployPendleVotingControllerUpgSubaction,
  DeployPendleVotingControllerUpgSubactionMsg,
} from '@actions/on-chain/subactions/deployPendleVotingControllerUpg'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleVotingControllerUpgSubaction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleVotingControllerUpgSubaction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleVotingControllerUpgSubactionMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployPendleVotingControllerUpgSubaction(client, {
      vePendle: '0x0000000000000000000000000000000000000002',
      pendleMsgSendEndpoint: '0x0000000000000000000000000000000000000003',
      initialApproxDestinationGas: 1n,
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleVotingControllerUpgSubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      vePendle: '0x0000000000000000000000000000000000000002',
      pendleMsgSendEndpoint: '0x0000000000000000000000000000000000000003',
      initialApproxDestinationGas: 1n,
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
    const pendleSwap = result.newRegistry.pendleVotingControllerUpgImpl!
    // check not undefined address
    expect(pendleSwap).not.toBeUndefined()
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendleVotingControllerUpgImpl = result.newMessage!.pendleVotingControllerUpgImpl
    // check messages
    expect(pendleVotingControllerUpgImpl).not.toBeUndefined()
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleVotingControllerUpgImpl = result.newRegistry.pendleVotingControllerUpgImpl
    const messagePendleVotingControllerUpgImpl = result.newMessage!.pendleVotingControllerUpgImpl
    // registry and message addresses should be matched
    expect(registryPendleVotingControllerUpgImpl === messagePendleVotingControllerUpgImpl).toBeTruthy()
  })
})
