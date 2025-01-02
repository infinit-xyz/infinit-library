import { beforeAll, describe, expect, test } from 'vitest'

// import { SubActionExecuteResponse } from '@infinit-xyz/core'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  // GrantRoleGuardianMsg,
  GrantRoleGuardianPendleGovernanceProxySubActionParams,
  GrantRoleGuardianSubAction,
} from '@actions/on-chain/subactions/grantRoleGuardianPendleGovernanceProxy'

// import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('GrantRoleGuardianSubAction', () => {
  // const registry: PendleRegistry = {}
  let subAction: GrantRoleGuardianSubAction
  let client: TestInfinitWallet
  const tester = ARBITRUM_TEST_ADDRESSES.tester
  // let result: SubActionExecuteResponse<PendleRegistry, GrantRoleGuardianMsg>
  // const callback = vi.fn()

  // TODO: use deployed contract address for implementation
  // note: use any implementation address that is a contract to avoid revert
  const params: GrantRoleGuardianPendleGovernanceProxySubActionParams = {
    pendleGovernanceProxy: ARBITRUM_TEST_ADDRESSES.tester,
    account: ARBITRUM_TEST_ADDRESSES.tester,
  }

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new GrantRoleGuardianSubAction(client, params)
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('GrantRoleGuardianSubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual(params)
  })

  test('validate should be success', async () => {
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  // TODO: test validate values after execute on the deployed contract
})