import { beforeAll, describe, expect, test } from 'vitest'

import { Address, privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mocks__/account'
import { DeployAccumulativeMerkleDistributorProxyAction } from '@actions/deployAccumulativeMerkleDistributorProxy'
import { DeployInfinitERC20Action } from '@actions/deployInfinitERC20'

import { TestChain, getForkRpcUrl } from '@infinit/test'
import { readArtifact } from '@utils/artifact'

describe('deployAccumulativeMerkleDistributorProxy', () => {
  let client: InfinitWallet

  // anvil rpc endpoint
  const rpcEndpoint = getForkRpcUrl(TestChain.arbitrum)
  // anvil tester pk
  const privateKey = ANVIL_PRIVATE_KEY

  beforeAll(() => {
    const account = privateKeyToAccount(privateKey)
    client = new InfinitWallet(arbitrum, rpcEndpoint, account)
  })

  test('deploy accumulativeMerkleDistributorProxy, owner is deployer', async () => {
    const deployTokenAction = new DeployInfinitERC20Action({
      params: {
        owner: client.walletClient.account.address,
        name: 'TestToken',
        symbol: 'TT',
        maxSupply: BigInt(1000000000000000000000000000),
        initialSupply: BigInt(500000000000000000000000),
      },
      signer: {
        deployer: client,
      },
    })
    const reg0 = await deployTokenAction.run({}, undefined, undefined)
    const deployedTokens: Address[] = Object.values(reg0.tokens!).map((d) => d.tokenAddress)
    const deployAccMerkProxyaction = new DeployAccumulativeMerkleDistributorProxyAction({
      params: {
        token: deployedTokens[0]!,
      },
      signer: {
        deployer: client,
      },
    })
    const reg = await deployAccMerkProxyaction.run({}, undefined, undefined)
    const deployedAccMerkle = Object.values(reg.accumulativeMerkleDistributors!).map((d) => d.proxyAddress)
    // read contract owner
    const merkleArtifact = await readArtifact('AccumulativeMerkleDistributor')
    const owner = await client.publicClient.readContract({
      address: deployedAccMerkle[0]!,
      abi: merkleArtifact.abi,
      functionName: 'owner',
      args: [],
    })
    expect(owner).toBe(client.walletClient.account.address)
  })
})
