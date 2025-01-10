import { beforeAll, describe, expect, test, vi } from 'vitest'

import { Address, zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  DeployPendleGaugeControllerMainchainUpgProxySubaction,
  DeployPendleGaugeControllerMainchainUpgProxySubactionMsg,
} from '@actions/on-chain/subactions/deployPendleGaugeControllerMainchainUpgProxy'

import { DeployPendleGaugeControllerMainchainUpgSubaction } from './deployPendleGaugeControllerMainchainUpg'
import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleGaugeControllerMainchainUpgProxySubaction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleGaugeControllerMainchainUpgProxySubaction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleGaugeControllerMainchainUpgProxySubactionMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester
  let pendleGaugeControllerImpl: Address
  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)

    // deploy impl
    const deployImplSubAction = new DeployPendleGaugeControllerMainchainUpgSubaction(client, {
      votingController: '0x0000000000000000000000000000000000000002',
      pendle: '0x0000000000000000000000000000000000000003',
      marketFactory: '0x0000000000000000000000000000000000000004',
      marketFactory2: '0x0000000000000000000000000000000000000005',
      marketFactory3: '0x0000000000000000000000000000000000000006',
      marketFactory4: '0x0000000000000000000000000000000000000007',
    })
    const deployImplRes = await deployImplSubAction.execute(registry, {}, callback)
    pendleGaugeControllerImpl = deployImplRes.newMessage!.pendleGaugeControllerMainchainUpgImpl

    subAction = new DeployPendleGaugeControllerMainchainUpgProxySubaction(client, {
      implementation: pendleGaugeControllerImpl,
      data: '0x',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleGaugeControllerMainchainUpgProxySubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      implementation: pendleGaugeControllerImpl,
      data: '0x',
    })
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('registry should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleGaugeControllerMainchainProxy = result.newRegistry.pendleGaugeControllerMainchainUpgProxy
    // check no zero address
    expect(registryPendleGaugeControllerMainchainProxy).not.toBeUndefined()
    expect(registryPendleGaugeControllerMainchainProxy).not.to.equal(zeroAddress)
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const messagePendleGaugeControllerMainchainProxy = result.newRegistry.pendleGaugeControllerMainchainUpgProxy
    // check messages
    expect(messagePendleGaugeControllerMainchainProxy).not.toBeUndefined()
    expect(messagePendleGaugeControllerMainchainProxy).not.to.equal(zeroAddress)
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registrypendleGaugeControllerMainchainUpgImpl = result.newRegistry.pendleGaugeControllerMainchainUpgImpl!
    const messagependleGaugeControllerMainchainUpgImpl = result.newRegistry.pendleGaugeControllerMainchainUpgImpl!
    // registry and message addresses should be matched
    expect(registrypendleGaugeControllerMainchainUpgImpl, messagependleGaugeControllerMainchainUpgImpl).toBeTruthy()
  })
})
