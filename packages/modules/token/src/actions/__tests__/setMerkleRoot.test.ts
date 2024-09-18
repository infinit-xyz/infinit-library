import { beforeAll, describe, expect, test } from 'vitest'

import { Hex } from 'viem'
import { Address, privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mocks__/account'
import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployAccumulativeMerkleDistributorAction } from '@actions/deployAccumulativeMerkleDistributor'
import { DeployInfinitERC20Action } from '@actions/deployInfinitERC20'
import { GetProofMerkleTreeAction } from '@actions/getProofMerkleTree'
import { SetMerkleRootAction } from '@actions/setMerkleRoot'

import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

describe('set merkle root', () => {
  let client: InfinitWallet
  // let bobClient: InfinitWallet

  // anvil rpc endpoint
  const rpcEndpoint = getForkRpcUrl(TestChain.arbitrum)
  // anvil tester pk
  const privateKey = ANVIL_PRIVATE_KEY

  beforeAll(() => {
    const account = privateKeyToAccount(privateKey)
    // bobClient = new TestInfinitWallet(TestChain.arbitrum, bob)
    client = new InfinitWallet(arbitrum, rpcEndpoint, account)
  })

  test('set merkle root', async () => {
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

    // gen root
    const genRootAction = new GetProofMerkleTreeAction({
      params: {
        userRewardMapping: {
          [client.walletClient.account.address]: '10',
          [TEST_ADDRESSES.bob]: '1',
          [TEST_ADDRESSES.tester2]: '2',
        },
        userAddress: client.walletClient.account.address,
      },
      signer: {},
    })
    const reg2 = await genRootAction.run(reg)

    // set merkle root
    const setMerkleRootAction = new SetMerkleRootAction({
      params: {
        accumulativeMerkleDistributor: deployedAccMerkle[0]!,
        root: reg2.merkleTree?.root as Hex,
      },
      signer: {
        owner: client,
      },
    })
    const reg3 = await setMerkleRootAction.run(reg2)
    const root = await client.publicClient.readContract({
      address: deployedAccMerkle[0]!,
      abi: merkleArtifact.abi,
      functionName: 'merkleRoot',
      args: [],
    })
    expect(root).toBe(reg3.merkleTree?.root)

    const erc20 = await readArtifact('InfinitERC20')
    // transfer tokens to merkle
    await client.walletClient.writeContract({
      address: deployedTokens[0]!,
      abi: erc20.abi,
      functionName: 'transfer',
      args: [deployedAccMerkle[0]!, 10n],
    })
    // read balance
    const balanceBeforeClaim = await client.publicClient.readContract({
      address: deployedTokens[0]!,
      abi: erc20.abi,
      functionName: 'balanceOf',
      args: [TEST_ADDRESSES.bob],
    })
    // test claim
    await client.walletClient.writeContract({
      address: deployedAccMerkle[0]!,
      abi: merkleArtifact.abi,
      functionName: 'claim',
      args: [TEST_ADDRESSES.bob, 10n, reg3.merkleTree?.merkle[client.walletClient.account.address].proof as Hex[]],
    })
    // balance after claim
    const balanceAfterClaim = await client.publicClient.readContract({
      address: deployedTokens[0]!,
      abi: erc20.abi,
      functionName: 'balanceOf',
      args: [TEST_ADDRESSES.bob],
    })
    expect(balanceAfterClaim).toBe(balanceBeforeClaim + 10n)
  })
})
