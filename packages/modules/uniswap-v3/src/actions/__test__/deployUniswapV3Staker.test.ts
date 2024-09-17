import { beforeAll, describe, expect, test } from 'vitest'

import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { setupUniswapV3 } from '@actions/__mock__/utils'
import { DeployUniswapV3StakerAction } from '@actions/deployUniswapV3Staker'

import { UniswapV3Registry } from '@/src/type'
import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'

describe('deployUniswapV3Staker', () => {
  let registry: UniswapV3Registry
  const client = new InfinitWallet(arbitrum, getForkRpcUrl(TestChain.arbitrum), privateKeyToAccount(ANVIL_PRIVATE_KEY))

  beforeAll(async () => {
    registry = await setupUniswapV3()
  })

  test('deploy uniswap v3 staker', async () => {
    const action = new DeployUniswapV3StakerAction({
      params: {
        factory: registry.uniswapV3Factory!,
        nonfungiblePositionManager: registry.nonfungiblePositionManager!,
        maxIncentiveStartLeadTime: 2592000n,
        maxIncentiveDuration: 63072000n,
      },
      signer: {
        deployer: client,
      },
    })
    registry = await action.run(registry)
    expect(registry.uniswapV3Staker).toBeDefined()
  })
})
