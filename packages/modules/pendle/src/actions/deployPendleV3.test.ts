import { beforeAll, describe, test } from 'vitest'

import { Account, privateKeyToAccount } from 'viem/accounts'

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
    const registry = {}
    const txData = await action.run(registry)
  })
})
