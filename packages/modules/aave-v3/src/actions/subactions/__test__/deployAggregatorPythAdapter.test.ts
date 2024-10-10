import { describe, expect, test, vi } from 'vitest'

import { Address, getContract, zeroAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  DeployAggregatorPythAdapterSubAction,
  DeployAggregatorPythAdapterSubActionParams,
} from '@actions/subactions/deployAggregatorPythAdapter'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployAggregatorPythAdapterSubAction', () => {
  let subAction: DeployAggregatorPythAdapterSubAction
  const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  const params: DeployAggregatorPythAdapterSubActionParams = {
    pyth: ARBITRUM_TEST_ADDRESSES.pyth,
    aggregatorPythAdapterConfigs: [
      {
        name: 'weth-usd',
        priceId: ARBITRUM_TEST_ADDRESSES.pythWethUsdPriceFeedId,
      },
      {
        name: 'wbtc-usd',
        priceId: ARBITRUM_TEST_ADDRESSES.pythWbtcUsdPriceFeedId,
      },
    ],
  }

  test('validate success', async () => {
    subAction = new DeployAggregatorPythAdapterSubAction(client, params)
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('validate throw error', async () => {
    subAction = new DeployAggregatorPythAdapterSubAction(client, {
      pyth: ARBITRUM_TEST_ADDRESSES.pyth,
      aggregatorPythAdapterConfigs: [
        {
          name: 'weth-usd',
          priceId: ARBITRUM_TEST_ADDRESSES.pythWethUsdPriceFeedId,
        },
        {
          name: 'wbtc-usd',
          priceId: '0x12345',
        },
      ],
    })
    await expect(subAction.validate()).rejects.toThrowError()
  })

  test('deploy aggregator pyth adaptors and validate', async () => {
    subAction = new DeployAggregatorPythAdapterSubAction(client, params)
    const registry: AaveV3Registry = {}
    const callback = vi.fn()
    const result = await subAction.execute(registry, {}, callback)
    const adapters = result.newRegistry.aggregatorPythAdapters!

    // check no zero address
    expect(adapters['weth-usd']).not.to.equal(zeroAddress)
    expect(adapters['wbtc-usd']).not.to.equal(zeroAddress)

    // check unique of the adapter addresses
    const adaptersSize = new Set(Object.values(adapters)).size
    expect(adaptersSize).to.equal(params.aggregatorPythAdapterConfigs.length)
    validateAdapter(adapters['weth-usd'])
    validateAdapter(adapters['wbtc-usd'])
  })

  async function validateAdapter(adapter: Address): Promise<void> {
    const aggregatorApi3AdapterArtifact = await readArtifact('AggregatorPythAdapter')

    // contract instance
    const aggregatorApi3Adapter = getContract({
      address: adapter,
      abi: aggregatorApi3AdapterArtifact.abi,
      client: client.publicClient,
    })

    // get info
    const decimals = aggregatorApi3Adapter.read.decimals()
    const lastestAnswer = aggregatorApi3Adapter.read.latestAnswer()
    const lastestTimestamp = aggregatorApi3Adapter.read.latestTimestamp()

    // validate
    expect(decimals).to.equal(8)
    expect(lastestAnswer).to.gt(0)
    expect(lastestTimestamp).to.gt(0)
  }
})
