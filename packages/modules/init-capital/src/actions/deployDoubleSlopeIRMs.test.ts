import { beforeAll, describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { DeployDoubleSlopeIRMsAction } from '@actions/deployDoubleSlopeIRMs'

import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'

describe('deployDoubleSlopeIRMsAction', () => {
  let action: DeployDoubleSlopeIRMsAction
  let client: InfinitWallet
  let client2: InfinitWallet

  // anvil rpc endpoint
  const rpcEndpoint = getForkRpcUrl(TestChain.arbitrum)
  // anvil tester pk
  const privateKey = ANVIL_PRIVATE_KEY

  beforeAll(() => {
    const account = privateKeyToAccount(privateKey)
    client = new InfinitWallet(arbitrum, rpcEndpoint, account)
    client2 = new InfinitWallet(arbitrum, rpcEndpoint, privateKeyToAccount(ANVIL_PRIVATE_KEY_2))
  })

  test('deploy all', async () => {
    action = new DeployDoubleSlopeIRMsAction({
      params: {
        doubleSlopeIRMConfigs: [
          {
            name: 'StablecoinIRM',
            params: {
              baseBorrowRateE18: 100000000000000000n,
              jumpUtilizationRateE18: 800000000000000000n,
              borrowRateMultiplierE18: 10000000000000000n,
              jumpRateMultiplierE18: 10000000000000000n,
            },
          },
          {
            name: 'MajorcoinIRM',
            params: {
              baseBorrowRateE18: 100000000000000000n,
              jumpUtilizationRateE18: 800000000000000000n,
              borrowRateMultiplierE18: 10000000000000000n,
              jumpRateMultiplierE18: 10000000000000000n,
            },
          },
        ],
      },
      signer: {
        deployer: client,
        accessControlManagerOwner: client2,
      },
    })
    const curRegistry = await action.run({}, undefined, undefined)

    // check that name in irms is correct
    expect(Object.keys(curRegistry.irms!)).toEqual(['StablecoinIRM', 'MajorcoinIRM'])
    for (const irm of Object.values(curRegistry.irms!)) {
      expect(irm).not.toBe(zeroAddress)
    }
  })
})
