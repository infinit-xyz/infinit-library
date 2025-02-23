import { beforeAll, describe, expect, test } from 'vitest'

import { Address, privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mocks__/account'
import { DeployAccumulativeMerkleDistributorAction } from '@actions/on-chain/deployAccumulativeMerkleDistributor'
import { DeployInfinitERC20Action } from '@actions/on-chain/deployInfinitERC20'

import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'
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
    const deployedTokens: Address[] = Object.keys(reg0.tokens!) as Address[]
    const deployAccMerkProxyaction = new DeployAccumulativeMerkleDistributorAction({
      params: {
        token: deployedTokens[0]!,
      },
      signer: {
        deployer: client,
      },
    })
    const reg = await deployAccMerkProxyaction.run({}, undefined, undefined)
    const deployedAccMerkle: Address[] = Object.keys(reg.accumulativeMerkleDistributors!) as Address[]
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
