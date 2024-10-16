import { describe, expect, test, vi } from 'vitest'

import { InfinitCache } from '@infinit-xyz/core'

import { FANTOM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployBandAdapterAction, DeployBandAdapterData } from '@actions/deployBandAdapter'
import { DeployBandAdapterSubAction } from '@actions/subactions/deployBandAdapter'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

vi.mock('@actions/subactions/deployBandAdapter')

// NOTE: test with Band oracle on Fantom
describe('Deploy band adapter action', () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, FANTOM_TEST_ADDRESSES.tester)

  const data: DeployBandAdapterData = {
    params: {
      ref: FANTOM_TEST_ADDRESSES.bandRef,
      bandAdapterConfigs: [
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
  const action = new DeployBandAdapterAction(data)
  const mockRegistry = {}

  test('should run sub-actions successfully', async () => {
    const mockSubActionExecute = vi.mocked(DeployBandAdapterSubAction.prototype.execute)
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
    const mockSubActionValidate = vi.mocked(DeployBandAdapterSubAction.prototype.validate)
    mockSubActionValidate.mockRejectedValueOnce(new Error('Validation Error'))

    await expect(action.run(mockRegistry)).rejects.toThrowError('Validation Error')
  })

  test('should throw an error if sub-action execution fails', async () => {
    const mockSubActionExecute = vi.mocked(DeployBandAdapterSubAction.prototype.execute)
    mockSubActionExecute.mockRejectedValueOnce(new Error('Execution Error'))

    await expect(action.run(mockRegistry)).rejects.toThrowError('Execution Error')
  })

  test('should handle cache correctly', async () => {
    const cache: InfinitCache = {
      name: 'DeployBandAdapterAction',
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

    const mockSubActionExecute = vi.mocked(DeployBandAdapterSubAction.prototype.execute)
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

    const mockSubAction = vi.mocked(DeployBandAdapterSubAction.prototype)
    mockSubAction.execute.mockResolvedValue({
      newRegistry: {},
      newMessage: {},
    })
    mockSubAction.txBuilders = []

    await action.run(mockRegistry, undefined, callback)

    expect(mockSubAction.execute).toHaveBeenCalledWith(mockRegistry, expect.any(Object), callback)
  })
})
