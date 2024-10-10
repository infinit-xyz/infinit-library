import { describe, expect, test, vi } from 'vitest'

import { getAddress, zeroAddress } from 'viem'

import { FANTOM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployAggregatorBandAdapterAction, DeployAggregatorBandAdapterData } from '@actions/deployAggregatorBandAdapter'

import { AaveV3Registry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

// NOTE: test with Band Oracle on fantom
describe('deploy aggregator api3 adapter action', () => {
  const client = new TestInfinitWallet(TestChain.fantom, FANTOM_TEST_ADDRESSES.tester)

  const data: DeployAggregatorBandAdapterData = {
    params: {
      ref: FANTOM_TEST_ADDRESSES.bandRef,
      aggregatorBandAdapterConfigs: [
        {
          name: 'eth-usd',
          base: 'ETH',
          quote: 'USD',
        },
        {
          name: 'wbtc-usd',
          base: 'WBTC',
          quote: 'USD',
        },
      ],
    },
    signer: { deployer: client },
  }

  test('deploy aggregator band adapter', async () => {
    const action = new DeployAggregatorBandAdapterAction(data)
    const registry: AaveV3Registry = {}
    const callback = vi.fn()
    const result: AaveV3Registry = await action.run(registry, undefined, callback)
    const adapters = result.aggregatorBandAdapters!
    // check if there is address in the registry and it not a zeroAddress
    expect(getAddress(adapters['eth-usd'])).not.to.equal(zeroAddress)
    expect(getAddress(adapters['wbtc-usd'])).not.to.equal(zeroAddress)
  })
})
