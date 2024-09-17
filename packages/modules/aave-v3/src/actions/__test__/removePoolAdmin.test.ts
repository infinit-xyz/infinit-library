import { describe, expect, test, vi } from 'vitest'

import { InfinitCache } from '@infinit-xyz/core'

import { TEST_ADDRESSES } from '@actions/__mock__/address'
import { RemovePoolAdminAction } from '@actions/removePoolAdmin'
import { RemovePoolAdminSubAction } from '@actions/subactions/removePoolAdmin'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

vi.mock('@actions/subactions/removePoolAdmin')

describe('RemovePoolAdminAction', () => {
  let action: RemovePoolAdminAction
  const aclManager = '0xa72636CbcAa8F5FF95B2cc47F3CDEe83F3294a0B'
  const bob = TEST_ADDRESSES.bob

  const tester = '0xFF1137243698CaA18EE364Cc966CF0e02A4e6327'
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  const mockRegistry = {}

  test.concurrent('name should not be undefined', () => {
    expect(action.name).not.toBeUndefined()
  })

  describe('run', () => {
    action = new RemovePoolAdminAction({
      params: {
        aclManager: aclManager,
        poolAdmin: bob,
      },
      signer: {
        aclAdmin: client,
      },
    })

    test('should run sub-actions successfully', async () => {
      const mockSubActionExecute = vi.mocked(RemovePoolAdminSubAction.prototype.execute)
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
      const mockSubActionValidate = vi.mocked(RemovePoolAdminSubAction.prototype.validate)
      mockSubActionValidate.mockRejectedValueOnce(new Error('Validation Error'))

      await expect(action.run(mockRegistry)).rejects.toThrowError('Validation Error')
    })

    test('should throw an error if sub-action execution fails', async () => {
      const mockSubActionExecute = vi.mocked(RemovePoolAdminSubAction.prototype.execute)
      mockSubActionExecute.mockRejectedValueOnce(new Error('Execution Error'))

      await expect(action.run(mockRegistry)).rejects.toThrowError('Execution Error')
    })

    test('should handle cache correctly', async () => {
      const cache: InfinitCache = {
        name: 'RemovePoolAdminAction',
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

      const mockSubActionExecute = vi.mocked(RemovePoolAdminSubAction.prototype.execute)
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

      const mockSubAction = vi.mocked(RemovePoolAdminSubAction.prototype)
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