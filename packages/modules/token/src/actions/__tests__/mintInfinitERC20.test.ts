import { beforeAll, describe, expect, test } from 'vitest'

import { Address, privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mocks__/account'
import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployInfinitERC20Action } from '@actions/deployInfinitERC20'
import { MintInfinitERC20Action } from '@actions/mintInfinitERC20'

import { TestChain, TestInfinitWallet, getForkRpcUrl } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

describe('mintInfinitERC20Action', () => {
  let action: DeployInfinitERC20Action
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

  test('simple mint', async () => {
    action = new DeployInfinitERC20Action({
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
    // for (const token of tokens) {
    const ttToken = tokens[0]
    expect(curRegistry.tokens![tokens[0]].type).toBe('InfinitERC20')

    const infinitERC20 = await readArtifact('InfinitERC20')
    const ownerBal = await client.publicClient.readContract({
      address: ttToken,
      abi: infinitERC20.abi,
      functionName: 'balanceOf',
      args: [client.walletClient.account.address],
    })
    expect(ownerBal).toBe(BigInt(500000000000000000000000))

    // test totalsupply
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

    const mintAction = new MintInfinitERC20Action({
      params: {
        token: ttToken,
        receivers: [client.walletClient.account.address],
        amounts: [mintAmount],
      },
      signer: {
        owner: client,
      },
    })
    await mintAction.run({}, undefined, undefined)
    const balanceAfterMint = await client.publicClient.readContract({
      address: ttToken,
      abi: infinitERC20.abi,
      functionName: 'balanceOf',
      args: [client.walletClient.account.address],
    })
    expect(balanceAfterMint).toBe(balanceBeforeMint + mintAmount)
  })
  // not owner cant mint
  test('not owner cant mint', async () => {
    action = new DeployInfinitERC20Action({
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

    const mintAmount = BigInt(100000000000000000000000)

    try {
      // Attempt to mint tokens as a non-owner
      const mintAction = new MintInfinitERC20Action({
        params: {
          token: ttToken,
          receivers: [client.walletClient.account.address],
          amounts: [mintAmount],
        },
        signer: {
          owner: bobClient,
        },
      })
      await mintAction.run({}, undefined, undefined)
      throw new Error("shouldn't be here")
    } catch (e) {
      expect(e).not.toBeUndefined()
    }
  })
})
