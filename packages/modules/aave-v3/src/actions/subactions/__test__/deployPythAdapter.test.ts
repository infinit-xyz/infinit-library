import { describe, expect, test, vi } from 'vitest'

import { Address, getContract, zeroAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployPythAdapterSubAction, DeployPythAdapterSubActionParams } from '@actions/subactions/deployPythAdapter'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPythAdapterSubAction', () => {
  let subAction: DeployPythAdapterSubAction
  const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  const params: DeployPythAdapterSubActionParams = {
    pyth: ARBITRUM_TEST_ADDRESSES.pyth,
    pythAdapterConfigs: [
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
    subAction = new DeployPythAdapterSubAction(client, params)
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('validate throw error', async () => {
    subAction = new DeployPythAdapterSubAction(client, {
      pyth: ARBITRUM_TEST_ADDRESSES.pyth,
      pythAdapterConfigs: [
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

  test('deploy pyth adaptors and validate', async () => {
    subAction = new DeployPythAdapterSubAction(client, params)
    const registry: AaveV3Registry = {}
    const callback = vi.fn()
    const result = await subAction.execute(registry, {}, callback)
    const adapters = result.newRegistry.pythAdapters!

    // check no zero address
    expect(adapters['weth-usd']).not.to.equal(zeroAddress)
    expect(adapters['wbtc-usd']).not.to.equal(zeroAddress)

    // check unique of the adapter addresses
    const adaptersSize = new Set(Object.values(adapters)).size
    expect(adaptersSize).to.equal(params.pythAdapterConfigs.length)
    validateAdapter(adapters['weth-usd'])
    validateAdapter(adapters['wbtc-usd'])
  })

  async function validateAdapter(adapter: Address): Promise<void> {
    const api3AdapterArtifact = await readArtifact('PythAdapter')

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
