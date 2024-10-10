import { describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { FANTOM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  DeployAggregatorBandAdapterSubAction,
  DeployAggregatorBandAdapterSubActionParams,
} from '@actions/subactions/deployAggregatorBandAdapter'

import { AaveV3Registry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployAggregatorBandAdapterSubAction', () => {
  let subAction: DeployAggregatorBandAdapterSubAction
  const tester = FANTOM_TEST_ADDRESSES.tester
  const client = new TestInfinitWallet(TestChain.fantom, tester)

  const params: DeployAggregatorBandAdapterSubActionParams = {
    ref: FANTOM_TEST_ADDRESSES.bandRef,
    aggregatorBandAdapterConfigs: [
      {
        name: 'weth-usd',
        base: 'WETH',
        quote: 'USD',
      },
      {
        name: 'wbtc-usd',
        base: 'WBTC',
        quote: 'USD',
      },
    ],
  }

  test('deploy aggregator band adaptors', async () => {
    subAction = new DeployAggregatorBandAdapterSubAction(client, params)
    const registry: AaveV3Registry = {}
    const callback = vi.fn()
    const result = await subAction.execute(registry, {}, callback)
    const adapters = result.newRegistry.aggregatorBandAdapters!

    // check no zero address
    expect(adapters['weth-usd']).not.to.equal(zeroAddress)
    expect(adapters['wbtc-usd']).not.to.equal(zeroAddress)

    // check unique of the adapter addresses
    const adaptersSize = new Set(Object.values(adapters)).size
    expect(adaptersSize).to.equal(params.aggregatorBandAdapterConfigs.length)
  })
})
