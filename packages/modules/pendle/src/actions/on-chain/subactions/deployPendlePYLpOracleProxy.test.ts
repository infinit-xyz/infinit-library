import { beforeAll, describe, expect, test, vi } from 'vitest'

import { Address, zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  DeployPendlePYLpOracleProxyMsg,
  DeployPendlePYLpOracleProxySubAction,
} from '@actions/on-chain/subactions/deployPendlePYLpOracleProxy'

import { DeployPendlePYLpOracleSubaction } from './deployPendlePYLpOracle'
import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendlePYLpOracleProxySubaction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendlePYLpOracleProxySubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendlePYLpOracleProxyMsg>
  let pendlePYLpOracleImpl: Address
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    const deployPendlePYLpOracle = new DeployPendlePYLpOracleSubaction(client)
    const pendlePYLpOracleRes = await deployPendlePYLpOracle.execute(registry, {}, callback)
    pendlePYLpOracleImpl = pendlePYLpOracleRes.newRegistry.pendlePYLpOracle!
    subAction = new DeployPendlePYLpOracleProxySubAction(client, {
      proxyAdmin: '0x0000000000000000000000000000000000000002',
      pendlePYLpOracleImpl: pendlePYLpOracleImpl,
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendlePYLpOracleProxySubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      proxyAdmin: '0x0000000000000000000000000000000000000002',
      pendlePYLpOracleImpl: pendlePYLpOracleImpl,
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
    const registrypendlePYLpOracle = result.newRegistry.pendlePYLpOracleProxy!
    const messagependlePYLpOracle = result.newMessage!.pendlePYLpOracleProxy
    // registry and message addresses should be matched
    expect(registrypendlePYLpOracle, messagependlePYLpOracle).toBeTruthy()
  })
})
