import { beforeAll, describe, expect, test } from 'vitest'

import { Address, privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mocks__/account'
import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployInfinitERC20BurnableAction } from '@actions/deployInfinitERC20Burnable'

import { TestChain, TestInfinitWallet, getForkRpcUrl } from '@infinit/test'
import { readArtifact } from '@utils/artifact'

describe('deployInfinitERC20BurnableBurnableAction', () => {
  let action: DeployInfinitERC20BurnableAction
  let client: InfinitWallet
  let bobClient: InfinitWallet

  // anvil rpc endpoint
  const rpcEndpoint = getForkRpcUrl(TestChain.arbitrum)
  const bob = TEST_ADDRESSES.bob
  // anvil tester pk
  const privateKey = ANVIL_PRIVATE_KEY

  beforeAll(() => {
    const account = privateKeyToAccount(privateKey)
    bobClient = new TestInfinitWallet(TestChain.arbitrum, bob)
    client = new InfinitWallet(arbitrum, rpcEndpoint, account)
  })

  test('deploy token, owner is deployer', async () => {
    action = new DeployInfinitERC20BurnableAction({
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
    const curRegistry = await action.run({}, undefined, undefined)

    expect(curRegistry.tokens).not.toBeUndefined()
    expect(curRegistry.tokens).not.toBe({})
    expect(curRegistry.tokens).not.toBe(null)
    // get all values of curRegistry.tokens
    const tokens: Address[] = Object.values(curRegistry.tokens!).map((v) => v.tokenAddress)
    const ttToken = tokens[0]
    expect(curRegistry.tokens![tokens[0]].type).toBe('InfinitERC20Burnable')

    const infinitERC20 = await readArtifact('InfinitERC20Burnable')
    const ownerBal = await client.publicClient.readContract({
      address: ttToken,
      abi: infinitERC20.abi,
      functionName: 'balanceOf',
      args: [client.walletClient.account.address],
    })
    expect(ownerBal).toBe(BigInt(500000000000000000000000))

    const totalSupply = await client.publicClient.readContract({
      address: ttToken,
      abi: infinitERC20.abi,
      functionName: 'totalSupply',
      args: [],
    })
    expect(totalSupply).toBe(BigInt(500000000000000000000000))

    const maxSupply = await client.publicClient.readContract({
      address: ttToken,
      abi: infinitERC20.abi,
      functionName: 'cap',
      args: [],
    })
    expect(maxSupply).toBe(BigInt(1000000000000000000000000000))

    // test mint
    const mintAmount = BigInt(100000000000000000000000)
    const balanceBeforeMint = await client.publicClient.readContract({
      address: ttToken,
      abi: infinitERC20.abi,
      functionName: 'balanceOf',
      args: [client.walletClient.account.address],
    })

    await client.walletClient.writeContract({
      address: ttToken,
      abi: infinitERC20.abi,
      functionName: 'mint',
      args: [client.walletClient.account.address, mintAmount],
    })
    const balanceAfterMint = await client.publicClient.readContract({
      address: ttToken,
      abi: infinitERC20.abi,
      functionName: 'balanceOf',
      args: [client.walletClient.account.address],
    })
    expect(balanceAfterMint).toBe(balanceBeforeMint + mintAmount)
  })

  // test deploy token, owner is not deployer
  test('deploy token, owner is not deployer', async () => {
    action = new DeployInfinitERC20BurnableAction({
      params: {
        owner: bob,
        name: 'TestToken',
        symbol: 'TT',
        maxSupply: BigInt(1000000000000000000000000000),
        initialSupply: BigInt(500000000000000000000000),
      },
      signer: {
        deployer: client,
      },
    })
    const curRegistry = await action.run({}, undefined, undefined)

    expect(curRegistry.tokens).not.toBeUndefined()
    expect(curRegistry.tokens).not.toBe({})
    expect(curRegistry.tokens).not.toBe(null)
    // get all values of curRegistry.tokens
    const tokens: Address[] = Object.values(curRegistry.tokens!).map((v) => v.tokenAddress)
    const ttToken = tokens[0]
    expect(curRegistry.tokens![tokens[0]].type).toBe('InfinitERC20Burnable')

    const infinitERC20 = await readArtifact('InfinitERC20Burnable')
    const deployerBal = await client.publicClient.readContract({
      address: ttToken,
      abi: infinitERC20.abi,
      functionName: 'balanceOf',
      args: [client.walletClient.account.address],
    })
    expect(deployerBal).toBe(BigInt(0))

    const ownerBal = await client.publicClient.readContract({
      address: ttToken,
      abi: infinitERC20.abi,
      functionName: 'balanceOf',
      args: [bob],
    })
    expect(ownerBal).toBe(BigInt(500000000000000000000000))

    const totalSupply = await client.publicClient.readContract({
      address: ttToken,
      abi: infinitERC20.abi,
      functionName: 'totalSupply',
      args: [],
    })
    expect(totalSupply).toBe(BigInt(500000000000000000000000))

    const maxSupply = await client.publicClient.readContract({
      address: ttToken,
      abi: infinitERC20.abi,
      functionName: 'cap',
      args: [],
    })
    expect(maxSupply).toBe(BigInt(1000000000000000000000000000))
  })

  // test deploy token, not owner cant mint
  test('deploy token, not owner cant mint', async () => {
    action = new DeployInfinitERC20BurnableAction({
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
    const curRegistry = await action.run({}, undefined, undefined)

    const tokens: Address[] = Object.values(curRegistry.tokens!).map((v) => v.tokenAddress)
    // owner mint tokens
    const ttToken = tokens[0]
    const infinitERC20 = await readArtifact('InfinitERC20Burnable')

    const mintAmount = BigInt(100000000000000000000000)

    try {
      // Attempt to mint tokens as a non-owner
      await bobClient.walletClient.writeContract({
        address: ttToken,
        abi: infinitERC20.abi,
        functionName: 'mint',
        args: [bob, mintAmount],
      })
    } catch (e) {
      expect(e).not.toBeUndefined()
    }
  })

  // test deploy token, test burn token
  test('deploy token, burn token', async () => {
    action = new DeployInfinitERC20BurnableAction({
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
    const curRegistry = await action.run({}, undefined, undefined)

    const tokens: Address[] = Object.values(curRegistry.tokens!).map((v) => v.tokenAddress)
    // owner mint tokens
    const ttToken = tokens[0]
    const infinitERC20 = await readArtifact('InfinitERC20Burnable')

    const burnAmount = BigInt(100000000000000000000000)
    const balanceBeforeBurn = await client.publicClient.readContract({
      address: ttToken,
      abi: infinitERC20.abi,
      functionName: 'balanceOf',
      args: [client.walletClient.account.address],
    })
    await client.walletClient.writeContract({
      address: ttToken,
      abi: infinitERC20.abi,
      functionName: 'burn',
      args: [burnAmount],
    })
    const balanceAfterBurn = await client.publicClient.readContract({
      address: ttToken,
      abi: infinitERC20.abi,
      functionName: 'balanceOf',
      args: [client.walletClient.account.address],
    })
    expect(balanceAfterBurn).toBe(balanceBeforeBurn - burnAmount)
  })
})
