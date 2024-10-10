import { describe, expect, test, vi } from 'vitest'

import { InfinitCache } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployAggregatorApi3AdapterAction, DeployAggregatorApi3AdapterData } from '@actions/deployAggregatorApi3Adapter'
import { DeployAggregatorApi3AdapterSubAction } from '@actions/subactions/deployAggregatorApi3Adapter'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

vi.mock('@actions/subactions/deployAggregatorApi3Adapter')

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
  const action = new DeployAggregatorApi3AdapterAction(data)
  const mockRegistry = {}

  test('should run sub-actions successfully', async () => {
    const mockSubActionExecute = vi.mocked(DeployAggregatorApi3AdapterSubAction.prototype.execute)
    mockSubActionExecute.mockResolvedValue({
      newRegistry: {
        ...mockRegistry,
      },
      newMessage: {},
    })

    await action.run(mockRegistry)

    expect(mockSubActionExecute).toHaveBeenCalledTimes(1)
  })

  test('should throw an error if sub-action validation fails', async () => {
    const mockSubActionValidate = vi.mocked(DeployAggregatorApi3AdapterSubAction.prototype.validate)
    mockSubActionValidate.mockRejectedValueOnce(new Error('Validation Error'))

    await expect(action.run(mockRegistry)).rejects.toThrowError('Validation Error')
  })

  test('should throw an error if sub-action execution fails', async () => {
    const mockSubActionExecute = vi.mocked(DeployAggregatorApi3AdapterSubAction.prototype.execute)
    mockSubActionExecute.mockRejectedValueOnce(new Error('Execution Error'))

    await expect(action.run(mockRegistry)).rejects.toThrowError('Execution Error')
  })

  test('should handle cache correctly', async () => {
    const cache: InfinitCache = {
      name: 'DeployAggregatorApi3AdapterAction',
      subActions: [
        {
          name: 'MockSubAction',
          transactions: [
            { name: 'txBuilder1', txHash: '0x1234567890abcdef' },
            { name: 'txBuilder2', txHash: '0xabcdef1234567890' },
          ],
        },
      ],
    }

    const mockSubActionExecute = vi.mocked(DeployAggregatorApi3AdapterSubAction.prototype.execute)
    mockSubActionExecute.mockResolvedValue({
      newRegistry: {
        ...mockRegistry,
      },
      newMessage: {},
    })

    await action.run(mockRegistry, cache)

    expect(mockSubActionExecute).toHaveBeenCalledWith(
      mockRegistry,
      {
        cache: {
          name: 'MockSubAction',
          transactions: [
            { name: 'txBuilder1', txHash: '0x1234567890abcdef' },
            { name: 'txBuilder2', txHash: '0xabcdef1234567890' },
          ],
        },
      },
      undefined,
    )
  })

  test('should handle callback correctly', async () => {
    const callback = vi.fn()

    const mockSubAction = vi.mocked(DeployAggregatorApi3AdapterSubAction.prototype)
    mockSubAction.execute.mockResolvedValue({
      newRegistry: {},
      newMessage: {},
    })
    mockSubAction.txBuilders = []

    await action.run(mockRegistry, undefined, callback)

    expect(mockSubAction.execute).toHaveBeenCalledWith(mockRegistry, expect.any(Object), callback)
  })
})
