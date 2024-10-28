import { beforeAll, describe, expect, test } from 'vitest'

import { encodeFunctionData } from 'viem'
import { Address, privateKeyToAccount } from 'viem/accounts'

import { ANVIL_PRIVATE_KEY } from '@actions/__mocks__/account'
import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployAccumulativeMerkleDistributorAction } from '@actions/deployAccumulativeMerkleDistributor'
import { DeployInfinitERC20Action } from '@actions/deployInfinitERC20'
import { SetMerkleRootAction } from '@actions/setMerkleRoot'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'
import { MerkleTree } from '@utils/merkleTree'

describe('set merkle root', () => {
  let client: TestInfinitWallet

  // anvil tester pk
  const privateKey = ANVIL_PRIVATE_KEY

  beforeAll(() => {
    const account = privateKeyToAccount(privateKey)
    client = new TestInfinitWallet(TestChain.arbitrum, account.address)
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
    const merkleTree = new MerkleTree({
      [client.walletClient.account.address]: '10',
      [TEST_ADDRESSES.bob]: '1',
      [TEST_ADDRESSES.tester2]: '2',
    })

    const generatedRoot = merkleTree.getRoot()

    const merkleContract = deployedAccMerkle[0]

    // set merkle root
    const setMerkleRootAction = new SetMerkleRootAction({
      params: {
        accumulativeMerkleDistributor: merkleContract,
        root: generatedRoot,
      },
      signer: {
        owner: client,
      },
    })

    await expect(setMerkleRootAction.run(reg)).resolves.toBeTruthy()

    const root = await client.publicClient.readContract({
      address: merkleContract,
      abi: merkleArtifact.abi,
      functionName: 'merkleRoot',
      args: [],
    })
    expect(root).toBe(generatedRoot)

    const erc20 = await readArtifact('InfinitERC20')

    // transfer tokens to merkle
    await client.sendTransactions([
      {
        name: 'transfer',
        txData: {
          to: deployedTokens[0]!,
          data: encodeFunctionData({
            abi: erc20.abi,
            functionName: 'transfer',
            args: [merkleContract, 10n],
          }),
        },
      },
    ])

    // read balance
    const balanceBeforeClaim = await client.publicClient.readContract({
      address: deployedTokens[0]!,
      abi: erc20.abi,
      functionName: 'balanceOf',
      args: [TEST_ADDRESSES.bob],
    })
    // test claim
    const clientProof = merkleTree.getProof(client.walletClient.account.address)
    await client.sendTransactions([
      {
        name: 'claim',
        txData: {
          to: merkleContract,
          data: encodeFunctionData({
            abi: merkleArtifact.abi,
            functionName: 'claim',
            args: [TEST_ADDRESSES.bob, BigInt(clientProof.amount), clientProof.proof],
          }),
        },
      },
    ])

    // balance after claim
    const balanceAfterClaim = await client.publicClient.readContract({
      address: deployedTokens[0]!,
      abi: erc20.abi,
      functionName: 'balanceOf',
      args: [TEST_ADDRESSES.bob],
    })
    expect(balanceAfterClaim).toBe(balanceBeforeClaim + BigInt(clientProof.amount))
  })
})
