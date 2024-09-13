import { beforeAll, describe, expect, test } from 'vitest'

import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { setupUniswapV3 } from '@actions/__mock__/utils'
import { EnableFeeAmountsAction } from '@actions/enableFeeAmounts'

import { UniswapV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'

describe('enableFeeAmountsAction', () => {
  let registry: UniswapV3Registry
  const client = new InfinitWallet(arbitrum, getForkRpcUrl(TestChain.arbitrum), privateKeyToAccount(ANVIL_PRIVATE_KEY))

  beforeAll(async () => {
    registry = await setupUniswapV3()
  })

  test('enableFeeAmounts 2% and 0.01%', async () => {
    const action = new EnableFeeAmountsAction({
      params: {
        uniswapV3Factory: registry.uniswapV3Factory!,
        feeAmounts: [
          {
            fee: 100,
            tickSpacing: 1,
          },
          {
            fee: 20000,
            tickSpacing: 400,
          },
        ],
      },
      signer: {
        factoryOwner: client,
      },
    })
    const newRegistry = await action.run(registry)
    expect(newRegistry).toStrictEqual(registry)
    // get feeAmountTickSpacing
    const uniswapV3FactoryArtifact = await readArtifact('UniswapV3Factory')
    let feeAmountTickSpacing: number = await client.publicClient.readContract({
      address: registry.uniswapV3Factory!,
      abi: uniswapV3FactoryArtifact.abi,
      functionName: 'feeAmountTickSpacing',
      args: [100],
    })
    expect(feeAmountTickSpacing).toBe(1)
    feeAmountTickSpacing = await client.publicClient.readContract({
      address: registry.uniswapV3Factory!,
      abi: uniswapV3FactoryArtifact.abi,
      functionName: 'feeAmountTickSpacing',
      args: [20000],
    })
    expect(feeAmountTickSpacing).toBe(400)
  })
})
