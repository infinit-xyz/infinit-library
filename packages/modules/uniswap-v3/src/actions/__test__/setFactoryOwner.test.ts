import { beforeAll, describe, expect, test } from 'vitest'

import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupUniswapV3 } from '@actions/__mock__/utils'
import { SetFactoryOwnerAction } from '@actions/setFactoryOwner'

import { UniswapV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'

describe('setFactoryOwnerAction', () => {
  let registry: UniswapV3Registry
  const client = new InfinitWallet(arbitrum, getForkRpcUrl(TestChain.arbitrum), privateKeyToAccount(ANVIL_PRIVATE_KEY))
  const oneAddress = ARBITRUM_TEST_ADDRESSES.oneAddress

  beforeAll(async () => {
    registry = await setupUniswapV3()
  }, 30_000)

  test('setFactoryOwner to address(1)', async () => {
    const action = new SetFactoryOwnerAction({
      params: {
        newOwner: oneAddress,
      },
      signer: {
        factoryOwner: client,
      },
    })
    const newRegistry = await action.run(registry)
    expect(newRegistry).toStrictEqual(registry)
    // get factory owner
    const uniswapV3FactoryArtifact = await readArtifact('UniswapV3Factory')
    const factoryOwner = await client.publicClient.readContract({
      address: registry.uniswapV3Factory!,
      abi: uniswapV3FactoryArtifact.abi,
      functionName: 'owner',
      args: [],
    })
    expect(factoryOwner).toBe(oneAddress)
  })
})
