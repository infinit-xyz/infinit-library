import { beforeAll, describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupInitCapital } from '@actions/__mock__/setup'
import { ChangeIrmAction, ChangeIrmActionData } from '@actions/changeIrm'

import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('ChangeIrm', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  let registry: InitCapitalRegistry

  beforeAll(async () => {
    registry = await setupInitCapital()
  })

  test('test set new irm', async () => {
    const data: ChangeIrmActionData = {
      signer: { deployer: client, guardian: client },
      params: {
        pool: registry.lendingPools!['INIT Ether'].lendingPool,
        doubleSlopeIRMConfig: {
          name: 'newIRM',
          params: {
            baseBorrowRateE18: 100000000000000000n,
            jumpUtilizationRateE18: 800000000000000000n,
            borrowRateMultiplierE18: 10000000000000000n,
            jumpRateMultiplierE18: 10000000000000000n,
          },
        },
      },
    }
    const action = new ChangeIrmAction(data)
    registry = await action.run(registry)
    const lendingPoolArtifact = await readArtifact('LendingPool')
    const irm = await client.publicClient.readContract({
      address: registry.lendingPools!['INIT Ether'].lendingPool,
      abi: lendingPoolArtifact.abi,
      functionName: 'irm',
      args: [],
    })
    expect(registry.lendingPools!['INIT Ether'].irm).toBe(irm)
  })
})
