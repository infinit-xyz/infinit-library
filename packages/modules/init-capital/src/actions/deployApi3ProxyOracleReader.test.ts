import { beforeAll, describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { setupInitCapital } from '@actions/__mock__/setup'
import { DeployApi3ProxyOracleReaderAction } from '@actions/deployApi3ProxyOracleReader'

import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('deployDoubleSlopeIRMsAction', () => {
  let action: DeployApi3ProxyOracleReaderAction

  // anvil tester pk
  const privateKey = ANVIL_PRIVATE_KEY
  let registry: InitCapitalRegistry
  const account = privateKeyToAccount(privateKey)
  const client = new TestInfinitWallet(TestChain.arbitrum, account.address)

  beforeAll(async () => {
    registry = await setupInitCapital()
  })

  test('deploy Api3ProxyOracle', async () => {
    action = new DeployApi3ProxyOracleReaderAction({
      params: {
        accessControlManager: registry.accessControlManager!,
        proxyAdmin: registry.proxyAdmin!,
      },
      signer: {
        deployer: client,
      },
    })
    const curRegistry = await action.run(registry, undefined, undefined)

    expect(curRegistry.api3ProxyOracleReaderImpl).not.toBe(zeroAddress)
    expect(curRegistry.api3ProxyOracleReaderImpl).not.toBe(zeroAddress)
  })
})
