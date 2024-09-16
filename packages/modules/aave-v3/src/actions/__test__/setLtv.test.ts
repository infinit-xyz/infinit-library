import { describe, expect, test, vi } from 'vitest'

import { InfinitCache } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetLtvAction } from '@actions/setLtv'
import { SetLtvSubAction } from '@actions/subactions/setLtvSubAction'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

vi.mock('@actions/subactions/setLtvSubAction')

describe('SetLtvAction', () => {
  let action: SetLtvAction
  const pool = ARBITRUM_TEST_ADDRESSES.pool
  const poolConfigurator = ARBITRUM_TEST_ADDRESSES.poolConfigurator
  const aclManager = ARBITRUM_TEST_ADDRESSES.aclManager
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const usdt = ARBITRUM_TEST_ADDRESSES.usdt
  const ethLtv = 8000n
  const usdtLtv = 7000n

  const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  const mockRegistry = {}

  test.concurrent('name should not be undefined', () => {
    expect(action.name).not.toBeUndefined()
  })

  describe('run', () => {
    action = new SetLtvAction({
      params: {
        ltvInfos: [
          {
            asset: weth,
            ltv: ethLtv,
          },
          {
            asset: usdt,
            ltv: usdtLtv,
          },
        ],
        pool,
        poolConfigurator,
        aclManager,
      },
      signer: {
        poolAdmin: client,
      },
    })

    test('should run sub-actions successfully', async () => {
      const mockSubActionExecute = vi.mocked(SetLtvSubAction.prototype.execute)
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
      const mockSubActionValidate = vi.mocked(SetLtvSubAction.prototype.validate)
      mockSubActionValidate.mockRejectedValueOnce(new Error('Validation Error'))

      await expect(action.run(mockRegistry)).rejects.toThrowError('Validation Error')
    })

    test('should throw an error if sub-action execution fails', async () => {
      const mockSubActionExecute = vi.mocked(SetLtvSubAction.prototype.execute)
      mockSubActionExecute.mockRejectedValueOnce(new Error('Execution Error'))

      await expect(action.run(mockRegistry)).rejects.toThrowError('Execution Error')
    })

    test('should handle cache correctly', async () => {
      const cache: InfinitCache = {
        name: 'SetLtvAction',
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

      const mockSubActionExecute = vi.mocked(SetLtvSubAction.prototype.execute)
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

      const mockSubAction = vi.mocked(SetLtvSubAction.prototype)
      mockSubAction.execute.mockResolvedValue({
        newRegistry: {},
        newMessage: {},
      })
      mockSubAction.txBuilders = []

      await action.run(mockRegistry, undefined, callback)

      expect(mockSubAction.execute).toHaveBeenCalledWith(mockRegistry, expect.any(Object), callback)
    })
  })
})
