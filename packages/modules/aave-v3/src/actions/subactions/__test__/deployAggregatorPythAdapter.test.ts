import { describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  DeployAggregatorPythAdapterSubAction,
  DeployAggregatorPythAdapterSubActionParams,
} from '@actions/subactions/deployAggregatorPythAdapter'

import { AaveV3Registry } from '@/src/type'
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

  test('deploy aggregator pyth adaptors', async () => {
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
  })
})
