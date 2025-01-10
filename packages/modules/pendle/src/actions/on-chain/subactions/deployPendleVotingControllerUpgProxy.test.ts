import { beforeAll, describe, expect, test, vi } from 'vitest'

import { Address, zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  DeployPendleVotingControllerUpgProxySubaction,
  DeployPendleVotingControllerUpgProxySubactionMsg,
} from '@actions/on-chain/subactions/deployPendleVotingControllerUpgProxy'

import { DeployPendleVotingControllerUpgSubaction } from './deployPendleVotingControllerUpg'
import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('deployPendleVotingControllerUpgProxySubAction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleVotingControllerUpgProxySubaction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleVotingControllerUpgProxySubactionMsg>
  let pendleVotingControllerImpl: Address
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    const deployPendleVotingControllerSubAction = new DeployPendleVotingControllerUpgSubaction(client, {
      vePendle: '0x0000000000000000000000000000000000000002',
      pendleMsgSendEndpoint: '0x0000000000000000000000000000000000000003',
      initialApproxDestinationGas: 1n,
    })
    const deployPendleVotingControllerRes = await deployPendleVotingControllerSubAction.execute(registry, {}, callback)
    pendleVotingControllerImpl = deployPendleVotingControllerRes.newRegistry.pendleVotingControllerUpgImpl!
    subAction = new DeployPendleVotingControllerUpgProxySubaction(client, {
      implementation: pendleVotingControllerImpl,
      data: '0x',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleVotingControllerUpgProxySubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      data: '0x',
      implementation: pendleVotingControllerImpl,
    })
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('registry should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendlePYLpOracle = result.newRegistry.pendlePYLpOracle!
    // check no zero address
    expect(pendlePYLpOracle).not.to.equal(zeroAddress)
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const messagependlePYLpOracle = result.newRegistry.pendlePYLpOracle!
    // check messages
    expect(messagependlePYLpOracle).not.to.equal(zeroAddress)
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const registryPendleVotingControllerUpgProxy = result.newRegistry.pendleVotingControllerUpgProxy
    const messagePendleVotingControllerUpgProxy = result.newMessage!.pendleVotingControllerUpgProxy
    // registry and message addresses should be matched
    expect(registryPendleVotingControllerUpgProxy, messagePendleVotingControllerUpgProxy).toBeTruthy()
  })
})
