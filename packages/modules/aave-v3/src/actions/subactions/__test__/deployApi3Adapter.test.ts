import { describe, expect, test, vi } from 'vitest'

import { Address, getContract, zeroAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployApi3AdapterSubAction, DeployApi3AdapterSubActionParams } from '@actions/subactions/deployApi3Adapter'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployApi3AdapterSubAction', () => {
  let subAction: DeployApi3AdapterSubAction
  const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  const params: DeployApi3AdapterSubActionParams = {
    api3AdapterConfigs: [
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
    subAction = new DeployApi3AdapterSubAction(client, params)
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('validate throw error', async () => {
    subAction = new DeployApi3AdapterSubAction(client, {
      api3AdapterConfigs: [
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

  test('deploy api3 adaptors and validate should be success', async () => {
    subAction = new DeployApi3AdapterSubAction(client, params)
    const registry: AaveV3Registry = {}
    const callback = vi.fn()
    const result = await subAction.execute(registry, {}, callback)
    const adapters = result.newRegistry.api3Adapters!

    // check no zero address
    expect(adapters['eth-usd']).not.to.equal(zeroAddress)
    expect(adapters['wbtc-usd']).not.to.equal(zeroAddress)

    // check unique of the adapter addresses
    const adaptersSize = new Set(Object.values(adapters)).size
    expect(adaptersSize).to.equal(params.api3AdapterConfigs.length)

    // validate contracts
    validateAdapter(adapters['eth-usd'])
    validateAdapter(adapters['wbtc-usd'])
  })

  async function validateAdapter(adapter: Address): Promise<void> {
    const api3AdapterArtifact = await readArtifact('Api3Adapter')

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
