import { describe, expect, test, vi } from 'vitest'

import { InfinitCache } from '@infinit-xyz/core'

import { FANTOM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployAggregatorBandAdapterAction, DeployAggregatorBandAdapterData } from '@actions/deployAggregatorBandAdapter'
import { DeployAggregatorBandAdapterSubAction } from '@actions/subactions/deployAggregatorBandAdapter'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

vi.mock('@actions/subactions/deployAggregatorBandAdapter')

// NOTE: test with Band oracle on Fantom
describe('Deploy aggregator band adapter action', () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, FANTOM_TEST_ADDRESSES.tester)

  const data: DeployAggregatorBandAdapterData = {
    params: {
      ref: FANTOM_TEST_ADDRESSES.bandRef,
      aggregatorBandAdapterConfigs: [
        {
          name: 'eth-usd',
          quote: 'WETH',
          base: 'USD',
        },
        {
          name: 'wbtc-usd',
          quote: 'WBTC',
          base: 'USD',
        },
      ],
    },
    signer: { deployer: client },
  }
  const action = new DeployAggregatorBandAdapterAction(data)
  const mockRegistry = {}

  test('should run sub-actions successfully', async () => {
    const mockSubActionExecute = vi.mocked(DeployAggregatorBandAdapterSubAction.prototype.execute)
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
    const mockSubActionValidate = vi.mocked(DeployAggregatorBandAdapterSubAction.prototype.validate)
    mockSubActionValidate.mockRejectedValueOnce(new Error('Validation Error'))

    await expect(action.run(mockRegistry)).rejects.toThrowError('Validation Error')
  })

  test('should throw an error if sub-action execution fails', async () => {
    const mockSubActionExecute = vi.mocked(DeployAggregatorBandAdapterSubAction.prototype.execute)
    mockSubActionExecute.mockRejectedValueOnce(new Error('Execution Error'))

    await expect(action.run(mockRegistry)).rejects.toThrowError('Execution Error')
  })

  test('should handle cache correctly', async () => {
    const cache: InfinitCache = {
      name: 'DeployAggregatorBandAdapterAction',
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

    const mockSubActionExecute = vi.mocked(DeployAggregatorBandAdapterSubAction.prototype.execute)
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

    const mockSubAction = vi.mocked(DeployAggregatorBandAdapterSubAction.prototype)
    mockSubAction.execute.mockResolvedValue({
      newRegistry: {},
      newMessage: {},
    })
    mockSubAction.txBuilders = []

    await action.run(mockRegistry, undefined, callback)

    expect(mockSubAction.execute).toHaveBeenCalledWith(mockRegistry, expect.any(Object), callback)
  })
})
