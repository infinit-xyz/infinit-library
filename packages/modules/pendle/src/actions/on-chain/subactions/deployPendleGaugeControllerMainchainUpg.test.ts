import { beforeAll, describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  DeployPendleGaugeControllerMainchainUpgSubaction,
  DeployPendleGaugeControllerMainchainUpgSubactionMsg,
} from '@actions/on-chain/subactions/deployPendleGaugeControllerMainchainUpg'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleGaugeControllerMainchainUpgSubaction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleGaugeControllerMainchainUpgSubaction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleGaugeControllerMainchainUpgSubactionMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployPendleGaugeControllerMainchainUpgSubaction(client, {
      votingController: '0x0000000000000000000000000000000000000002',
      pendle: '0x0000000000000000000000000000000000000003',
      marketFactory: '0x0000000000000000000000000000000000000004',
      marketFactory2: '0x0000000000000000000000000000000000000005',
      marketFactory3: '0x0000000000000000000000000000000000000006',
      marketFactory4: '0x0000000000000000000000000000000000000007',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleGaugeControllerMainchainUpgSubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      votingController: '0x0000000000000000000000000000000000000002',
      pendle: '0x0000000000000000000000000000000000000003',
      marketFactory: '0x0000000000000000000000000000000000000004',
      marketFactory2: '0x0000000000000000000000000000000000000005',
      marketFactory3: '0x0000000000000000000000000000000000000006',
      marketFactory4: '0x0000000000000000000000000000000000000007',
    })
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('registry should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleGaugeControllerMainchain = result.newRegistry.pendleGaugeControllerMainchainUpgImpl
    // check no zero address
    expect(registryPendleGaugeControllerMainchain).not.to.equal(zeroAddress)
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const messagePendleGaugeControllerMainchain = result.newMessage!.pendleGaugeControllerMainchainUpgImpl
    // check messages
    expect(messagePendleGaugeControllerMainchain).not.to.equal(zeroAddress)
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registrypendleGaugeControllerMainchainUpgImpl = result.newRegistry.pendleGaugeControllerMainchainUpgImpl!
    const messagependleGaugeControllerMainchainUpgImpl = result.newRegistry.pendleGaugeControllerMainchainUpgImpl!
    // registry and message addresses should be matched
    expect(registrypendleGaugeControllerMainchainUpgImpl, messagependleGaugeControllerMainchainUpgImpl).toBeTruthy()
  })
})
