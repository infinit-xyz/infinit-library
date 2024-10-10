import { describe, expect, test, vi } from 'vitest'

import { getAddress, zeroAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployAggregatorApi3AdapterAction, DeployAggregatorApi3AdapterData } from '@actions/deployAggregatorApi3Adapter'

import { AaveV3Registry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

// NOTE: test with Api3 oracle on Arbitrum
describe('Deploy aggregator api3 adapter action', () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, ARBITRUM_TEST_ADDRESSES.tester)

  const data: DeployAggregatorApi3AdapterData = {
    params: {
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
    },
    signer: { deployer: client },
  }

  test('deploy aggregator api3 adapter', async () => {
    const action = new DeployAggregatorApi3AdapterAction(data)
    const registry: AaveV3Registry = {}
    const callback = vi.fn()
    const result: AaveV3Registry = await action.run(registry, undefined, callback)
    const adapters = result.aggregatorApi3Adapters!
    // check if there is address in the registry and it not a zeroAddress
    expect(getAddress(adapters['eth-usd'])).not.to.equal(zeroAddress)
    expect(getAddress(adapters['wbtc-usd'])).not.to.equal(zeroAddress)
  })
})
