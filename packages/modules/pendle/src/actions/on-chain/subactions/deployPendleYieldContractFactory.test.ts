import { beforeAll, describe, expect, test, vi } from 'vitest'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  DeployPendleYieldContractFactorySubaction,
  DeployPendleYieldContractFactorySubactionMsg,
} from '@actions/on-chain/subactions/deployPendleYieldContractFactory'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleYieldContractFactory', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleYieldContractFactorySubaction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleYieldContractFactorySubactionMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployPendleYieldContractFactorySubaction(client, {
      ytCreationCodeContractA: '0x0000000000000000000000000000000000000002',
      ytCreationCodeSizeA: 100n,
      ytCreationCodeContractB: '0x0000000000000000000000000000000000000003',
      ytCreationCodeSizeB: 101n,
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleYieldContractFactorySubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      ytCreationCodeContractA: '0x0000000000000000000000000000000000000002',
      ytCreationCodeSizeA: 100n,
      ytCreationCodeContractB: '0x0000000000000000000000000000000000000003',
      ytCreationCodeSizeB: 101n,
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
    const pendleSwap = result.newRegistry.pendleYieldContractFactory!
    // check not undefined address
    expect(pendleSwap).not.toBeUndefined()
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendleSwap = result.newMessage!.pendleYieldContractFactory
    // check messages
    expect(pendleSwap).not.toBeUndefined()
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleYieldContractFactory = result.newRegistry.pendleYieldContractFactory
    const messagePendleYieldContractFactory = result.newMessage!.pendleYieldContractFactory
    // registry and message addresses should be matched
    expect(registryPendleYieldContractFactory === messagePendleYieldContractFactory).toBeTruthy()
  })
})
