import { beforeAll, describe, expect, test } from 'vitest'

import { Address, privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupUniswapV3, swap } from '@actions/__mock__/utils'
import { SetFeeProtocolAction } from '@actions/setFeeProtocol'

import { UniswapV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, getForkRpcUrl } from '@infinit/test'

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
  })

  test('setFeeProtocol to 25%', async () => {
    const action = new SetFeeProtocolAction({
      params: {
        uniswapV3Factory: registry.uniswapV3Factory!,
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
    const newRegistry = await action.run(registry)
    expect(newRegistry).toStrictEqual(registry)
    // get feeProtocol
    const uniswapV3PoolArtifact = await readArtifact('UniswapV3Pool')
    const slot0: [bigint, number, number, number, number, number, boolean] = await client.publicClient.readContract({
      address: poolETHUSDT500,
      abi: uniswapV3PoolArtifact.abi,
      functionName: 'slot0',
      args: [],
    })
    const feeProtocol = slot0[5]
    expect(feeProtocol % 16).toBe(4)
    expect(feeProtocol >> 4).toBe(4)
    // swap
    await swap(client, registry.swapRouter02!, weth, usdt, 500, BigInt(1 * 10 ** 18))
    await swap(client, registry.swapRouter02!, usdt, weth, 500, BigInt(1000 * 10 ** 6))
    // get balance
    // get token0, token1 protocol fee
    const protocolFees: [bigint, bigint] = await client.publicClient.readContract({
      address: poolETHUSDT500,
      abi: uniswapV3PoolArtifact.abi,
      functionName: 'protocolFees',
      args: [],
    })
    expect(protocolFees[0]).not.toBe(0n)
    expect(protocolFees[1]).not.toBe(0n)
  })
})
