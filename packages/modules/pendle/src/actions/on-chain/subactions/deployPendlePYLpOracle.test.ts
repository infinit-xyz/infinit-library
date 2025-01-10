import { beforeAll, describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployPendlePYLpOracleMsg, DeployPendlePYLpOracleSubaction } from '@actions/on-chain/subactions/deployPendlePYLpOracle'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendlePYLpOracleSubaction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendlePYLpOracleSubaction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendlePYLpOracleMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployPendlePYLpOracleSubaction(client)
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendlePYLpOracleSubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({})
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
    const registrypendlePYLpOracle = result.newRegistry.pendlePYLpOracle!
    const messagependlePYLpOracle = result.newMessage!.pendlePYLpOracle!
    // registry and message addresses should be matched
    expect(registrypendlePYLpOracle, messagependlePYLpOracle).toBeTruthy()
  })
})
