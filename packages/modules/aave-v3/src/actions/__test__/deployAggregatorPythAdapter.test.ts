import { describe, expect, test, vi } from 'vitest'

import { getAddress, zeroAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployAggregatorPythAdapterAction, DeployAggregatorPythAdapterData } from '@actions/deployAggregatorPythAdapter'

import { AaveV3Registry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

// NOTE: test with Pyth Oracle on arbitrum
describe('deploy aggregator pyth adapter action', () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, ARBITRUM_TEST_ADDRESSES.tester)

  const data: DeployAggregatorPythAdapterData = {
    params: {
      pyth: ARBITRUM_TEST_ADDRESSES.pyth,
      aggregatorPythAdapterConfigs: [
        {
          name: 'eth-usd',
          priceId: ARBITRUM_TEST_ADDRESSES.pythWethUsdPriceFeedId,
        },
        {
          name: 'wbtc-usd',
          priceId: ARBITRUM_TEST_ADDRESSES.pythWethUsdPriceFeedId,
        },
      ],
    },
    signer: { deployer: client },
  }

  test('deploy aggregator pyth adapter', async () => {
    const action = new DeployAggregatorPythAdapterAction(data)
    const registry: AaveV3Registry = {}
    const callback = vi.fn()
    const result: AaveV3Registry = await action.run(registry, undefined, callback)
    const adapters = result.aggregatorPythAdapters!
    // check if there is address in the registry and it not a zeroAddress
    expect(getAddress(adapters['eth-usd'])).not.to.equal(zeroAddress)
    expect(getAddress(adapters['wbtc-usd'])).not.to.equal(zeroAddress)
  })
})
