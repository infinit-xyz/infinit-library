import { describe, expect, test, vi } from 'vitest'

import { InfinitCache } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployAggregatorPythAdapterAction, DeployAggregatorPythAdapterData } from '@actions/deployAggregatorPythAdapter'
import { DeployAggregatorPythAdapterSubAction } from '@actions/subactions/deployAggregatorPythAdapter'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

vi.mock('@actions/subactions/deployAggregatorPythAdapter')

// NOTE: test with Pyth oracle on Arbitrum
describe('Deploy aggregator pyth adapter action', () => {
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
          priceId: ARBITRUM_TEST_ADDRESSES.pythWbtcUsdPriceFeedId,
        },
      ],
    },
    signer: { deployer: client },
  }
  const action = new DeployAggregatorPythAdapterAction(data)
  const mockRegistry = {}

  test('should run sub-actions successfully', async () => {
    const mockSubActionExecute = vi.mocked(DeployAggregatorPythAdapterSubAction.prototype.execute)
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
    const mockSubActionValidate = vi.mocked(DeployAggregatorPythAdapterSubAction.prototype.validate)
    mockSubActionValidate.mockRejectedValueOnce(new Error('Validation Error'))

    await expect(action.run(mockRegistry)).rejects.toThrowError('Validation Error')
  })

  test('should throw an error if sub-action execution fails', async () => {
    const mockSubActionExecute = vi.mocked(DeployAggregatorPythAdapterSubAction.prototype.execute)
    mockSubActionExecute.mockRejectedValueOnce(new Error('Execution Error'))

    await expect(action.run(mockRegistry)).rejects.toThrowError('Execution Error')
  })

  test('should handle cache correctly', async () => {
    const cache: InfinitCache = {
      name: 'DeployAggregatorPythAdapterAction',
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

    const mockSubActionExecute = vi.mocked(DeployAggregatorPythAdapterSubAction.prototype.execute)
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

    const mockSubAction = vi.mocked(DeployAggregatorPythAdapterSubAction.prototype)
    mockSubAction.execute.mockResolvedValue({
      newRegistry: {},
      newMessage: {},
    })
    mockSubAction.txBuilders = []

    await action.run(mockRegistry, undefined, callback)

    expect(mockSubAction.execute).toHaveBeenCalledWith(mockRegistry, expect.any(Object), callback)
  })
})
