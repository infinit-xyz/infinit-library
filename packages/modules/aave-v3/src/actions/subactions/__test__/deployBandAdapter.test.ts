import { describe, expect, test, vi } from 'vitest'

import { Address, getContract, zeroAddress } from 'viem'

import { FANTOM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployBandAdapterSubAction, DeployBandAdapterSubActionParams } from '@actions/subactions/deployBandAdapter'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployBandAdapterSubAction', () => {
  let subAction: DeployBandAdapterSubAction
  const tester = FANTOM_TEST_ADDRESSES.tester
  const client = new TestInfinitWallet(TestChain.fantom, tester)

  const params: DeployBandAdapterSubActionParams = {
    ref: FANTOM_TEST_ADDRESSES.bandRef,
    bandAdapterConfigs: [
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
    subAction = new DeployBandAdapterSubAction(client, params)
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('validate throw error', async () => {
    subAction = new DeployBandAdapterSubAction(client, {
      ref: FANTOM_TEST_ADDRESSES.bandRef,
      bandAdapterConfigs: [
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

  test('deploy band adaptors and validate', async () => {
    subAction = new DeployBandAdapterSubAction(client, params)
    const registry: AaveV3Registry = {}
    const callback = vi.fn()
    const result = await subAction.execute(registry, {}, callback)
    const adapters = result.newRegistry.bandAdapters!

    // check no zero address
    expect(adapters['weth-usd']).not.to.equal(zeroAddress)
    expect(adapters['wbtc-usd']).not.to.equal(zeroAddress)

    // check unique of the adapter addresses
    const adaptersSize = new Set(Object.values(adapters)).size
    expect(adaptersSize).to.equal(params.bandAdapterConfigs.length)

    validateAdapter(adapters['weth-usd'])
    validateAdapter(adapters['wbtc-usd'])
  })

  async function validateAdapter(adapter: Address): Promise<void> {
    const api3AdapterArtifact = await readArtifact('BandAdapter')

    // contract instance
    const api3Adapter = getContract({
      address: adapter,
      abi: api3AdapterArtifact.abi,
      client: client.publicClient,
    })

    // get info
    const decimals = api3Adapter.read.decimals()
    const lastestAnswer = api3Adapter.read.latestAnswer()
    const lastestTimestamp = api3Adapter.read.latestTimestamp()

    // validate
    expect(decimals).to.equal(8)
    expect(lastestAnswer).to.gt(0)
    expect(lastestTimestamp).to.gt(0)
  }
})
