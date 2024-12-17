import { beforeAll, describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'
import { Account, privateKeyToAccount } from 'viem/accounts'

import { PendleV3Registry } from '../type'
import { ANVIL_PRIVATE_KEY } from './__mock__/account'
import { DeployPendleV3Action } from './deployPendleV3'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('deployAaveV3Action', () => {
  let client: TestInfinitWallet
  let account: Account
  const bnAddress = '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8'
  beforeAll(() => {
    account = privateKeyToAccount(ANVIL_PRIVATE_KEY)
    client = new TestInfinitWallet(TestChain.arbitrum, account.address)
  })

  test('deployPendleV3Action', async () => {
    const action = new DeployPendleV3Action({
      params: {
        refundAddress: bnAddress,
        lzEndpoint: bnAddress,
        governanceToken: bnAddress,
        initialApproxDestinationGas: BigInt(100000),
      },
      signer: {
        deployer: client,
      },
    })
    let registry = {}
    registry = await action.run(registry)
    checkRegistry(registry)
  })
})

const checkRegistry = (registry: PendleV3Registry) => {
  expect(registry.baseSplitCodeFactoryContract).not.toBe(zeroAddress)
  expect(registry.pendleSwap).not.toBe(zeroAddress)
  expect(registry.pendleMsgSendEndpointUpgImpl).not.toBe(zeroAddress)
  expect(registry.pendleMsgSendEndpointUpgProxy).not.toBe(zeroAddress)
  expect(registry.votingEscrowPendleMainchain).not.toBe(zeroAddress)
  expect(registry.pendleYieldContractFactory).not.toBe(zeroAddress)
}
