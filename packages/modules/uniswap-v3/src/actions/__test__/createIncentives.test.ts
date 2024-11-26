import { beforeAll, describe, expect, test } from 'vitest'

import { encodeFunctionData } from 'viem'
import { Address, privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupUniswapV3 } from '@actions/__mock__/utils'
import { CreateIncentivesAction } from '@actions/createIncentives'

import { UniswapV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'

describe('createIncentivesAction', () => {
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

  test('createIncentive', async () => {
    const block = await client.publicClient.getBlock()
    const action = new CreateIncentivesAction({
      params: {
        incentiveInfos: [
          {
            incentiveKey: {
              rewardToken: weth,
              pool: poolETHUSDT500,
              startTime: block.timestamp + 100n,
              endTime: block.timestamp + 1000n,
              refundee: ARBITRUM_TEST_ADDRESSES.oneAddress,
            },
            reward: 100n,
          },
        ],
      },
      signer: {
        incentiveCreator: client,
      },
    })
    // approve rewardToken
    const ierc20Artifact = await readArtifact('@openzeppelin/contracts-3.4.1-solc-0.7-2/token/ERC20/IERC20.sol:IERC20')
    const approveData = encodeFunctionData({
      abi: ierc20Artifact.abi,
      functionName: 'approve',
      args: [registry.uniswapV3Staker!, 100n],
    })
    await client.sendTransactions([
      {
        name: 'approve rewardToken',
        txData: {
          to: weth,
          data: approveData,
        },
      },
    ])
    const newRegistry = await action.run(registry)
    expect(newRegistry).toStrictEqual(registry)
  })
})
