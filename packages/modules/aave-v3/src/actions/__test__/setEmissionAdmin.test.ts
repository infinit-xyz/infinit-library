import { beforeAll, describe, expect, test, vi } from 'vitest'

import { Address } from 'viem'

import { ContractValidateError } from '@infinit-xyz/core/errors'

import { ARBITRUM_TEST_ADDRESSES, TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupAaveV3 } from '@actions/__mock__/setup'
import { SetEmissionAdminAction } from '@actions/setEmissionAdmin'

import { AaveV3Registry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

vi.mock('@actions/subactions/setLtvSubAction')

describe('EmissionManager:SetEmissionAdminAction', () => {
  let action: SetEmissionAdminAction
  let client: TestInfinitWallet
  let bob: TestInfinitWallet
  let registry: AaveV3Registry
  let emissionManager: Address

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, ARBITRUM_TEST_ADDRESSES.tester)
    bob = new TestInfinitWallet(TestChain.arbitrum, TEST_ADDRESSES.bob)
    registry = await setupAaveV3()

    emissionManager = registry.emissionManager!
  })

  test('not admin shouldnt be able to call', async () => {
    action = new SetEmissionAdminAction({
      params: {
        emissionManager: emissionManager,
        reward: ARBITRUM_TEST_ADDRESSES.usdt,
        admin: ARBITRUM_TEST_ADDRESSES.tester,
      },
      signer: {
        emissionManagerOwner: bob,
      },
    })
    await expect(action.run(registry)).rejects.toThrowError(new ContractValidateError('CALLER_NOT_OWNER'))
  })

  test('should run successfully', async () => {
    action = new SetEmissionAdminAction({
      params: {
        emissionManager: emissionManager,
        reward: ARBITRUM_TEST_ADDRESSES.usdt,
        admin: ARBITRUM_TEST_ADDRESSES.tester,
      },
      signer: {
        emissionManagerOwner: client,
      },
    })
    await action.run(registry)

    // read abi
    const emissionManagerArtifact = await readArtifact('EmissionManager')
    // read owner
    const emissionAdmin: Address = await client.publicClient.readContract({
      address: emissionManager,
      abi: emissionManagerArtifact.abi,
      functionName: 'getEmissionAdmin',
      args: [ARBITRUM_TEST_ADDRESSES.usdt],
    })
    expect(emissionAdmin).toBe(ARBITRUM_TEST_ADDRESSES.tester)
  })
})
