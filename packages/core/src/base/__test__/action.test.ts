import { MOCK_PRIVATE_KEY } from '@infinit-wallet/__mock__/constants.mock'
import { InfinitWallet } from '@infinit-wallet/index'
import { privateKeyToAccount } from 'viem/accounts'
import { linea } from 'viem/chains'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { Chain } from 'viem'

import { MockSubAction } from '@/base/__mock__/subAction.mock'
import { MockAction } from '@base/__mock__/action.mock'
import { MockActionData, MockRegistry } from '@base/__mock__/type.mock'
import { Action } from '@base/action'

import { InfinitCache } from 'src/types'

vi.mock('@base/__mock__/subAction.mock')

const mockRegistry: MockRegistry = {
  poolAddress: '0x1234',
}

const CHAIN: Chain = linea
const rpcEndpoint = 'https://rpc.linea.build'

const account = privateKeyToAccount(MOCK_PRIVATE_KEY)

const data: MockActionData = {
  params: {
    poolAddress: '0x1234',
  },
  signer: {
    dev: new InfinitWallet(CHAIN, rpcEndpoint, account),
    exec: new InfinitWallet(CHAIN, rpcEndpoint, account),
  },
}

describe('MockAction', () => {
  let action: Action

  beforeEach(() => {
    action = new MockAction(data)
  })

  test.concurrent('name should not be undefined', () => {
    expect(action.name).not.toBeUndefined()
  })

  describe('run', () => {
    test('should run sub-actions successfully', async () => {
      const mockSubActionExecute = vi.mocked(MockSubAction.prototype.execute)
      mockSubActionExecute.mockResolvedValue({
        newRegistry: {
          ...mockRegistry,
          owner: '0x1234',
        },
        newMessage: {},
      })

      await action.run(mockRegistry)

      expect(mockSubActionExecute).toHaveBeenCalledTimes(3)
    })

    test('should throw an error if sub-action validation fails', async () => {
      const mockSubActionValidate = vi.mocked(MockSubAction.prototype.validate)
      mockSubActionValidate.mockRejectedValueOnce(new Error('Validation Error'))

      await expect(action.run(mockRegistry)).rejects.toThrowError('Validation Error')
    })

    test('should throw an error if sub-action execution fails', async () => {
      const mockSubActionValidate = vi.mocked(MockSubAction.prototype.execute)
      mockSubActionValidate.mockRejectedValueOnce(new Error('Execution Error'))

      await expect(action.run(mockRegistry)).rejects.toThrowError('Execution Error')
    })

    test('should handle cache correctly', async () => {
      const cache: InfinitCache = {
        name: 'MockAction',
        subActions: [
          {
            name: 'MockSubAction',
            transactions: [
              {
                name: 'txBuilder1',
                txHash: '0x1234567890abcdef',
              },
              {
                name: 'txBuilder2',
                txHash: '0xabcdef1234567890',
              },
            ],
          },
        ],
      }

      const mockSubActionExecute = vi.mocked(MockSubAction.prototype.execute)
      mockSubActionExecute.mockResolvedValue({
        newRegistry: {
          ...mockRegistry,
        },
        newMessage: {},
      })

      await action.run(mockRegistry, cache)

      expect(mockSubActionExecute, '1st call').toHaveBeenNthCalledWith(
        1,
        mockRegistry,
        {
          cache: {
            name: 'MockSubAction',
            transactions: [
              {
                name: 'txBuilder1',
                txHash: '0x1234567890abcdef',
              },
              {
                name: 'txBuilder2',
                txHash: '0xabcdef1234567890',
              },
            ],
          },
        },
        undefined,
      )
      expect(mockSubActionExecute, '2nd call').toHaveBeenNthCalledWith(2, mockRegistry, { cache: undefined }, undefined)
      expect(mockSubActionExecute, '3rd call').toHaveBeenNthCalledWith(3, mockRegistry, { cache: undefined }, undefined)
    })

    test('should handle callback correctly', async () => {
      const callback = vi.fn()

      const mockSubAction = vi.mocked(MockSubAction.prototype)
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
