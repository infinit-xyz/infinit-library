import { describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  DeployAggregatorApi3AdapterSubAction,
  DeployAggregatorApi3AdapterSubActionParams,
} from '@actions/subactions/deployAggregatorApi3Adapter'

import { AaveV3Registry } from '@/src/type'
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

  test('deploy aggregator api3 adaptors', async () => {
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
  })
})
