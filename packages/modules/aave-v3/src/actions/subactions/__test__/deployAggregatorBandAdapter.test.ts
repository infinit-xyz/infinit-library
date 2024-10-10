import { describe, expect, test, vi } from 'vitest'

import { Address, getContract, zeroAddress } from 'viem'

import { FANTOM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  DeployAggregatorBandAdapterSubAction,
  DeployAggregatorBandAdapterSubActionParams,
} from '@actions/subactions/deployAggregatorBandAdapter'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
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

  test('validate success', async () => {
    subAction = new DeployAggregatorBandAdapterSubAction(client, params)
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('validate throw error', async () => {
    subAction = new DeployAggregatorBandAdapterSubAction(client, {
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
          quote: '',
        },
      ],
    })
    await expect(subAction.validate()).rejects.toThrowError()
  })

  test('deploy aggregator band adaptors and validate', async () => {
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

    validateAdapter(adapters['weth-usd'])
    validateAdapter(adapters['wbtc-usd'])
  })

  async function validateAdapter(adapter: Address): Promise<void> {
    const aggregatorApi3AdapterArtifact = await readArtifact('AggregatorBandAdapter')

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
