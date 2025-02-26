import { beforeAll, describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  InitializePendleGovernanceProxySubAction,
  InitializePendleGovernanceProxySubActionParams,
} from '@actions/on-chain/subactions/initializePendleGovernanceProxy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('InitializePendleGovernanceProxySubAction', () => {
  let subAction: InitializePendleGovernanceProxySubAction
  let client: TestInfinitWallet
  const tester = ARBITRUM_TEST_ADDRESSES.tester

  // TODO: use deployed contract address for implementation
  // note: use any implementation address that is a contract to avoid revert
  const params: InitializePendleGovernanceProxySubActionParams = {
    pendleGovernanceProxy: ARBITRUM_TEST_ADDRESSES.tester,
    governance: ARBITRUM_TEST_ADDRESSES.tester,
  }

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new InitializePendleGovernanceProxySubAction(client, params)
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('InitializePendleGovernanceProxySubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual(params)
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  // TODO: test validate values after execute on the deployed contract
})
