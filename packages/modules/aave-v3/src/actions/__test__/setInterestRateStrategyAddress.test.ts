import { describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { InfinitCache } from '@infinit-xyz/core'

import { SetInterestRateStrategyAddressAction } from '@actions/setInterestRateStrategyAddress'
import { SetInterestRateStrategyAddressSubAction } from '@actions/subactions/setReserveInterestRateStrategyAddressSubAction'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

vi.mock('@actions/subactions/setReserveInterestRateStrategyAddressSubAction')

describe('SetInterestRateStrategyAddressAction', () => {
  let action: SetInterestRateStrategyAddressAction
  const pool = '0x794a61358D6845594F94dc1DB02A252b5b4814aD'
  const poolConfigurator = '0x8145eddDf43f50276641b55bd3AD95944510021E'
  const aclManager = '0xa72636CbcAa8F5FF95B2cc47F3CDEe83F3294a0B'
  const weth = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
  const usdt = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'

  const tester = '0xFF1137243698CaA18EE364Cc966CF0e02A4e6327'
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  const mockRegistry = {}

  test.concurrent('name should not be undefined', () => {
    expect(action.name).not.toBeUndefined()
  })

  describe('run', () => {
    action = new SetInterestRateStrategyAddressAction({
      params: {
        interestRateStrategyAddressInfos: [
          {
            asset: weth,
            interestRateStrategy: zeroAddress,
          },
          {
            asset: usdt,
            interestRateStrategy: zeroAddress,
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
      const mockSubActionExecute = vi.mocked(SetInterestRateStrategyAddressSubAction.prototype.execute)
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
      const mockSubActionValidate = vi.mocked(SetInterestRateStrategyAddressSubAction.prototype.validate)
      mockSubActionValidate.mockRejectedValueOnce(new Error('Validation Error'))

      await expect(action.run(mockRegistry)).rejects.toThrowError('Validation Error')
    })

    test('should throw an error if sub-action execution fails', async () => {
      const mockSubActionExecute = vi.mocked(SetInterestRateStrategyAddressSubAction.prototype.execute)
      mockSubActionExecute.mockRejectedValueOnce(new Error('Execution Error'))

      await expect(action.run(mockRegistry)).rejects.toThrowError('Execution Error')
    })

    test('should handle cache correctly', async () => {
      const cache: InfinitCache = {
        name: 'SetInterestRateStrategyAddressAction',
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

      const mockSubActionExecute = vi.mocked(SetInterestRateStrategyAddressSubAction.prototype.execute)
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

      const mockSubAction = vi.mocked(SetInterestRateStrategyAddressSubAction.prototype)
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
