import { beforeAll, describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployUniswapV3Action } from '@actions/deployUniswapV3'

import { readArtifact } from '@/src/utils/artifact'
import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'

describe('deployUniswapV3Action', () => {
  let action: DeployUniswapV3Action
  let client: InfinitWallet

  // anvil rpc endpoint
  const rpcEndpoint = getForkRpcUrl(TestChain.arbitrum)
  // anvil tester pk
  const privateKey = ANVIL_PRIVATE_KEY
  const oneAddress = ARBITRUM_TEST_ADDRESSES.oneAddress

  const weth = ARBITRUM_TEST_ADDRESSES.weth
  beforeAll(() => {
    const account = privateKeyToAccount(privateKey)
    client = new InfinitWallet(arbitrum, rpcEndpoint, account)
  })

  test('deploy all', async () => {
    action = new DeployUniswapV3Action({
      params: {
        nativeCurrencyLabel: 'ETH',
        proxyAdminOwner: oneAddress,
        factoryOwner: oneAddress,
        maxIncentiveStartLeadTime: 0n,
        maxIncentiveDuration: 0n,
        wrappedNativeToken: weth,
        uniswapV2Factory: zeroAddress,
      },
      signer: {
        deployer: client,
      },
    })
    const curRegistry = await action.run({}, undefined, undefined)

    expect(curRegistry.uniswapV3Factory).not.toBe(zeroAddress)
    expect(curRegistry.nftDescriptor).not.toBe(zeroAddress)
    expect(curRegistry.tickLens).not.toBe(zeroAddress)
    expect(curRegistry.proxyAdmin).not.toBe(zeroAddress)
    expect(curRegistry.swapRouter02).not.toBe(zeroAddress)
    expect(curRegistry.quoterV2).not.toBe(zeroAddress)
    expect(curRegistry.nonfungibleTokenPositionDescriptorImpl).not.toBe(zeroAddress)
    expect(curRegistry.nonfungibleTokenPositionDescriptor).not.toBe(zeroAddress)
    expect(curRegistry.nonfungiblePositionManager).not.toBe(zeroAddress)
    expect(curRegistry.uniswapV3Staker).not.toBe(zeroAddress)
    // check factory owner
    const uniswapV3FactoryArtifact = await readArtifact('UniswapV3Factory')
    const factoryOwner = await client.publicClient.readContract({
      address: curRegistry.uniswapV3Factory!,
      abi: uniswapV3FactoryArtifact.abi,
      functionName: 'owner',
      args: [],
    })
    expect(factoryOwner).toBe(oneAddress)
    // check proxy admin owner
    const proxyAdminArtifact = await readArtifact('ProxyAdmin')
    const proxyAdminOwner = await client.publicClient.readContract({
      address: curRegistry.proxyAdmin!,
      abi: proxyAdminArtifact.abi,
      functionName: 'owner',
      args: [],
    })
    expect(proxyAdminOwner).toBe(oneAddress)
  })
})
