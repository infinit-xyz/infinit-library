import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { privateKeyToAccount } from 'viem/accounts'
import { linea } from 'viem/chains'

import { MockSubAction } from '@base/__mock__/subAction.mock'
import { SubAction, SubActionData } from '@base/subAction'
import { TxBuilder } from '@base/txBuilder'

import { ActionCallback } from '@/types'
import { TransactionCache } from '@/types/cache'

import { MOCK_PRIVATE_KEY } from '@infinit-wallet/__mock__/constants.mock'
import { InfinitWallet } from '@infinit-wallet/index'

const CHAIN = linea
const rpcEndpoint = 'https://rpc.linea.build'

const successTxHash = '0x10ac4ba498382e6280a23740d9d6afeb170586befcce866f3cdf5d1670af7e28'
const failTxHash = '0xf4b59d25a813cd82fb01bc36ea5038947a70b1f646e54073c3d60fcac694e9a7'

describe('subAction', () => {
  let subAction: MockSubAction
  let client: InfinitWallet

  beforeAll(() => {
    const account = privateKeyToAccount(MOCK_PRIVATE_KEY)
    client = new InfinitWallet(CHAIN, rpcEndpoint, account)

    subAction = new MockSubAction(client, true)
  })

  test.concurrent('name should not be undefined', () => {
    expect(subAction.name).not.toBeUndefined()
  })

  test.concurrent('txBuilders length > 0', () => {
    expect(subAction.txBuilders.length).toBeGreaterThan(0)
  })

  describe('validate', () => {
    test('should not throw error if validation is successful', async () => {
      const successSubAction = new MockSubAction(client, true)
      await expect(successSubAction.validate()).resolves.not.toThrowError()
    })

    test('should throw error if validation fails', async () => {
      const failSubAction = new MockSubAction(client, false)
      await expect(failSubAction.validate()).rejects.toThrowError()
    })
  })

  describe('checkCache', () => {
    test('should return 1 if cache contains at least one txHash', async () => {
      const txCaches: TransactionCache[] = [
        { name: 'successTx', txHash: successTxHash },
        { name: 'failTx', txHash: failTxHash },
      ]

      const i = await subAction.checkCache(txCaches)

      expect(i).toEqual(1)
    })

    test('should return 0 if cache is empty', async () => {
      const i = await subAction.checkCache([])

      expect(i).toEqual(0)
    })

    test('should handle callback txChecked correctly', async () => {
      const txCaches: TransactionCache[] = [
        { name: 'successTx', txHash: successTxHash },
        { name: 'failTx', txHash: failTxHash },
      ]

      const callback: ActionCallback = vi.fn()

      await subAction.checkCache(txCaches, callback)

      const walletAddress = client.walletClient.account.address
      expect(callback).toBeCalledWith('txChecked', { txHash: successTxHash, status: 'CONFIRMED', walletAddress })
      expect(callback).toBeCalledWith('txChecked', { txHash: failTxHash, status: 'REVERTED', walletAddress })
      expect(callback).toBeCalledTimes(2)
    })
  })

  describe('execute', () => {
    let mockSubAction: SubAction

    beforeEach(() => {
      mockSubAction = new MockSubAction(client, true)
    })

    test('should call getTx on all txBuilders and sendTransactions', async () => {
      const subActionData: SubActionData = {
        cache: {
          name: 'MockSubAction',
          transactions: [],
        },
      }

      const spyGetTx0 = vi.spyOn(mockSubAction.txBuilders[0] as TxBuilder, 'getTx')
      const spyGetTx1 = vi.spyOn(mockSubAction.txBuilders[1] as TxBuilder, 'getTx')
      const spySendTransactions = vi.spyOn(client, 'sendTransactions')
      spySendTransactions.mockResolvedValue([])

      await mockSubAction.execute({}, subActionData)

      expect(spyGetTx0).toHaveBeenCalled()
      expect(spyGetTx1).toHaveBeenCalled()
      expect(spySendTransactions).toHaveBeenCalled()
    })

    test('should skip txBuilders that are in the cache', async () => {
      const txCaches: TransactionCache[] = [
        { name: 'successTx', txHash: successTxHash },
        { name: 'failTx', txHash: failTxHash },
      ]
      const subActionData: SubActionData = {
        cache: {
          name: 'MockSubAction',
          transactions: txCaches,
        },
      }

      const spyGetTx0 = vi.spyOn(mockSubAction.txBuilders[0] as TxBuilder, 'getTx')
      const spyGetTx1 = vi.spyOn(mockSubAction.txBuilders[1] as TxBuilder, 'getTx')
      const spySendTransactions = vi.spyOn(client, 'sendTransactions')
      spySendTransactions.mockResolvedValue([])

      await mockSubAction.execute({}, subActionData)

      expect(spyGetTx0).not.toHaveBeenCalled()
      expect(spyGetTx1).toHaveBeenCalled()
      expect(spySendTransactions).toHaveBeenCalled()
    })
  })
})
