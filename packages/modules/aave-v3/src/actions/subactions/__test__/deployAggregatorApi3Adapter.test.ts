import { describe, expect, test, vi } from 'vitest'

import { Address, getContract, zeroAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  DeployAggregatorApi3AdapterSubAction,
  DeployAggregatorApi3AdapterSubActionParams,
} from '@actions/subactions/deployAggregatorApi3Adapter'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployAggregatorApi3AdapterSubAction', () => {
  let subAction: DeployAggregatorApi3AdapterSubAction
  const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  const params: DeployAggregatorApi3AdapterSubActionParams = {
    aggregatorApi3AdapterConfigs: [
      {
        name: 'eth-usd',
        dataFeedProxy: ARBITRUM_TEST_ADDRESSES.api3EthUsdDapiProxy,
      },
      {
        name: 'wbtc-usd',
        dataFeedProxy: ARBITRUM_TEST_ADDRESSES.api3WbtcUsdDapiProxy,
      },
    ],
  }

  test('validate success', async () => {
    subAction = new DeployAggregatorApi3AdapterSubAction(client, params)
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('validate throw error', async () => {
    subAction = new DeployAggregatorApi3AdapterSubAction(client, {
      aggregatorApi3AdapterConfigs: [
        {
          name: 'eth-usd',
          dataFeedProxy: zeroAddress,
        },
        {
          name: 'wbtc-usd',
          dataFeedProxy: ARBITRUM_TEST_ADDRESSES.api3WbtcUsdDapiProxy,
        },
      ],
    })
    await expect(subAction.validate()).rejects.toThrowError()
  })

  test('deploy aggregator api3 adaptors and validate should be success', async () => {
    subAction = new DeployAggregatorApi3AdapterSubAction(client, params)
    const registry: AaveV3Registry = {}
    const callback = vi.fn()
    const result = await subAction.execute(registry, {}, callback)
    const adapters = result.newRegistry.aggregatorApi3Adapters!

    // check no zero address
    expect(adapters['eth-usd']).not.to.equal(zeroAddress)
    expect(adapters['wbtc-usd']).not.to.equal(zeroAddress)

    // check unique of the adapter addresses
    const adaptersSize = new Set(Object.values(adapters)).size
    expect(adaptersSize).to.equal(params.aggregatorApi3AdapterConfigs.length)

    // validate contracts
    validateAdapter(adapters['eth-usd'])
    validateAdapter(adapters['wbtc-usd'])
  })

  async function validateAdapter(adapter: Address): Promise<void> {
    const aggregatorApi3AdapterArtifact = await readArtifact('AggregatorApi3Adapter')

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
