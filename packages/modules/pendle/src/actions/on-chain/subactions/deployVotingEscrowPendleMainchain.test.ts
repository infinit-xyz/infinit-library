import { beforeAll, describe, expect, test, vi } from 'vitest'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  DeployPendleStaticFacetsMsg,
  DeployVotingEscrowPendleMainchainSubaction,
} from '@actions/on-chain/subactions/deployVotingEscrowPendleMainchain'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('deployVotingEscrowPendleMainchain', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployVotingEscrowPendleMainchainSubaction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleStaticFacetsMsg>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployVotingEscrowPendleMainchainSubaction(client, {
      pendle: '0x0000000000000000000000000000000000000002',
      pendleMsgSendEndpoint: '0x0000000000000000000000000000000000000003',
      initialApproxDestinationGas: 10n,
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployVotingEscrowPendleMainchainSubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      pendle: '0x0000000000000000000000000000000000000002',
      pendleMsgSendEndpoint: '0x0000000000000000000000000000000000000003',
      initialApproxDestinationGas: 10n,
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
    const votingEscrowPendleMainchain = result.newRegistry!.votingEscrowPendleMainchain

    // check not undefined address
    expect(votingEscrowPendleMainchain).not.toBeUndefined()
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const votingEscrowPendleMainchain = result.newMessage!.votingEscrowPendleMainchain

    // check not undefined address
    expect(votingEscrowPendleMainchain).not.toBeUndefined()
  })

  test('registry and message should be matched', async () => {
    result = await subAction.execute(registry, {}, callback)
    const votingEscrowPendleMainchainReg = result.newRegistry!.votingEscrowPendleMainchain

    const votingEscrowPendleMainchainMsg = result.newMessage!.votingEscrowPendleMainchain
    // registry and message addresses should be matched
    expect(votingEscrowPendleMainchainReg === votingEscrowPendleMainchainMsg).toBeTruthy()
  })
})
