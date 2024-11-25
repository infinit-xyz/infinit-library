import { beforeAll, describe, expect, test } from 'vitest'

import { Address, privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { balanceOf, setupUniswapV3, swap } from '@actions/__mock__/utils'
import { CollectProtocolAction } from '@actions/collectProtocol'
import { SetFeeProtocolAction } from '@actions/setFeeProtocol'

import { UniswapV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'

describe('setFeeProtocolAction', () => {
  let registry: UniswapV3Registry
  const client = new InfinitWallet(arbitrum, getForkRpcUrl(TestChain.arbitrum), privateKeyToAccount(ANVIL_PRIVATE_KEY))
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const usdt = ARBITRUM_TEST_ADDRESSES.usdt
  let poolETHUSDT500: Address

  beforeAll(async () => {
    registry = await setupUniswapV3()
    const uniswapV3FactoryArtifact = await readArtifact('UniswapV3Factory')

    poolETHUSDT500 = await client.publicClient.readContract({
      address: registry.uniswapV3Factory!,
      abi: uniswapV3FactoryArtifact.abi,
      functionName: 'getPool',
      args: [weth, usdt, 500],
    })
    const action = new SetFeeProtocolAction({
      params: {
        feeProtocolInfos: [
          {
            pool: poolETHUSDT500,
            feeProtocol0: 4, // 25%
            feeProtocol1: 4, // 25%
          },
        ],
      },
      signer: {
        factoryOwner: client,
      },
    })
    await action.run(registry)
  })

  test('collect fee', async () => {
    // swap
    await swap(client, registry.swapRouter02!, weth, usdt, 500, BigInt(1 * 10 ** 18))
    await swap(client, registry.swapRouter02!, usdt, weth, 500, BigInt(1000 * 10 ** 6))
    // get token0, token1 protocol fee
    const uniswapV3PoolArtifact = await readArtifact('UniswapV3Pool')
    const protocolFees: [bigint, bigint] = await client.publicClient.readContract({
      address: poolETHUSDT500,
      abi: uniswapV3PoolArtifact.abi,
      functionName: 'protocolFees',
      args: [],
    })
    expect(protocolFees[0]).not.toBe(0n)
    expect(protocolFees[1]).not.toBe(0n)
    // get balance before collect
    const balanceToken0Bf = await balanceOf(client, weth, registry.feeVault!)
    const balanceToken1Bf = await balanceOf(client, usdt, registry.feeVault!)
    // collect
    const action = new CollectProtocolAction({
      params: {
        pools: [poolETHUSDT500],
      },
      signer: {
        factoryOwner: client,
      },
    })
    await action.run(registry)
    // get balance after collect
    const balanceToken0Af = await balanceOf(client, weth, registry.feeVault!)
    const balanceToken1Af = await balanceOf(client, usdt, registry.feeVault!)
    // check balance
    // note: uniswap pool will leave 1 wei for gas optimization purpose
    expect(balanceToken0Af - balanceToken0Bf + 1n).toBe(protocolFees[0])
    expect(balanceToken1Af - balanceToken1Bf + 1n).toBe(protocolFees[1])
  })
})
