import { beforeAll, describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'

import { InitCapitalRegistry } from '@/src/type'
import { setupInitCapital } from '@actions/__mock__/setup'
import { DeployPythOracleReaderAction } from '@actions/deployPythOracleReader'
import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

describe('deployDoubleSlopeIRMsAction', () => {
  let action: DeployPythOracleReaderAction
  let client: InfinitWallet

  // anvil rpc endpoint
  const rpcEndpoint = getForkRpcUrl(TestChain.arbitrum)
  // anvil tester pk
  const privateKey = ANVIL_PRIVATE_KEY
  let registry: InitCapitalRegistry

  beforeAll(async () => {
    const account = privateKeyToAccount(privateKey)
    client = new InfinitWallet(arbitrum, rpcEndpoint, account)
    registry = await setupInitCapital()
  })

  test('deploy PythOracleReader', async () => {
    action = new DeployPythOracleReaderAction({
      params: {
        accessControlManager: registry.accessControlManager!,
        proxyAdmin: registry.proxyAdmin!,
        pyth: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
      },
      signer: {
        deployer: client,
      },
    })
    const curRegistry = await action.run(registry, undefined, undefined)

    expect(curRegistry.pythOracleReaderProxy).not.toBe(zeroAddress)
    expect(curRegistry.pythOracleReaderImpl).not.toBe(zeroAddress)

    // get that pyth from pythOracleReaderProxy
    const pythOracleReaderArtifact = await readArtifact('PythOracleReader')
    const pyth = await client.publicClient.readContract({
      address: curRegistry.pythOracleReaderProxy!,
      abi: pythOracleReaderArtifact.abi,
      functionName: 'pyth',
      args: [],
    })
    expect(pyth).toBe('0xff1a0f4744e8582DF1aE09D5611b887B6a12925C')
  })
})
