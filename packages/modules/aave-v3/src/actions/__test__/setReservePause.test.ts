import { describe, expect, test, vi } from 'vitest'

import { InfinitCache } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetReservePauseAction } from '@actions/setReservePause'
import { SetReservePauseSubAction } from '@actions/subactions/setReservePauseSubAction'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

vi.mock('@actions/subactions/setReservePauseSubAction')

describe('SetReservePauseAction', () => {
  let action: SetReservePauseAction
  const poolConfigurator = ARBITRUM_TEST_ADDRESSES.poolConfigurator
  const aclManager = ARBITRUM_TEST_ADDRESSES.aclManager
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const usdt = ARBITRUM_TEST_ADDRESSES.usdt

  const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  const mockRegistry = {}

  test.concurrent('name should not be undefined', () => {
    expect(action.name).not.toBeUndefined()
  })

  describe('run', () => {
    action = new SetReservePauseAction({
      params: {
        reservePauseInfos: [
          {
            asset: weth,
            paused: true,
          },
          {
            asset: usdt,
            paused: true,
          },
        ],
        poolConfigurator,
        aclManager,
      },
      signer: {
        poolAdmin: client,
      },
    })

    test('should run sub-actions successfully', async () => {
      const mockSubActionExecute = vi.mocked(SetReservePauseSubAction.prototype.execute)
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
      const mockSubActionValidate = vi.mocked(SetReservePauseSubAction.prototype.validate)
      mockSubActionValidate.mockRejectedValueOnce(new Error('Validation Error'))

      await expect(action.run(mockRegistry)).rejects.toThrowError('Validation Error')
    })

    test('should throw an error if sub-action execution fails', async () => {
      const mockSubActionExecute = vi.mocked(SetReservePauseSubAction.prototype.execute)
      mockSubActionExecute.mockRejectedValueOnce(new Error('Execution Error'))

      await expect(action.run(mockRegistry)).rejects.toThrowError('Execution Error')
    })

    test('should handle cache correctly', async () => {
      const cache: InfinitCache = {
        name: 'SetReservePauseAction',
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

      const mockSubActionExecute = vi.mocked(SetReservePauseSubAction.prototype.execute)
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

      const mockSubAction = vi.mocked(SetReservePauseSubAction.prototype)
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
