import { beforeAll, describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeploySupplyCapReaderMsg, DeploySupplyCapReaderSubAction } from '@actions/subactions/deploySupplyCapReader'

import { PendleV3Registry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeploySupplyCapReaderSubAction', () => {
  const registry: PendleV3Registry = {}
  let subAction: DeploySupplyCapReaderSubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleV3Registry, DeploySupplyCapReaderMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeploySupplyCapReaderSubAction(client, {})
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeploySupplyCapReaderSubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({})
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('registry should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const supplyCapReader = result.newRegistry.supplyCapReader!
    // check no zero address
    expect(supplyCapReader).not.to.equal(zeroAddress)
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const messageSupplyCapReader = result.newRegistry.supplyCapReader!
    // check messages
    expect(messageSupplyCapReader).not.to.equal(zeroAddress)
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registrySupplyCapReader = result.newRegistry.supplyCapReader!
    const messageSupplyCapReader = result.newMessage!.supplyCapReader!
    // registry and message addresses should be matched
    expect(registrySupplyCapReader, messageSupplyCapReader).toBeTruthy()
  })
})
