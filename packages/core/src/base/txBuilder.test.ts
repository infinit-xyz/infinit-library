import { beforeAll, describe, expect, test } from 'vitest'

import { privateKeyToAccount } from 'viem/accounts'
import { linea } from 'viem/chains'

import { MockTxBuilder } from '@base/__mock__/txBuilder.mock'
import { TxBuilder } from '@base/txBuilder'

import { TransactionData } from '@/types'

import { MOCK_PRIVATE_KEY } from '@infinit-wallet/__mock__/constants.mock'
import { InfinitWallet } from '@infinit-wallet/index'

describe('txBuilder', () => {
  let txBuilder: TxBuilder
  let client: InfinitWallet

  beforeAll(() => {
    const account = privateKeyToAccount(MOCK_PRIVATE_KEY)
    client = new InfinitWallet(linea, 'https://rpc.linea.build', account)

    txBuilder = new MockTxBuilder(client)
  })

  test('name should not be undefined', () => {
    expect(txBuilder.name).not.toBeUndefined()
  })

  // test validate
  describe('validate', () => {
    test('should not throw error if validation is successful', async () => {
      // success -> no error
      const successTxBuilder = new MockTxBuilder(client, true)
      await expect(successTxBuilder.validate()).resolves.not.toThrowError()
    })

    test('should throw error if validation fails', async () => {
      // fail -> throw error
      const failTxBuilder = new MockTxBuilder(client, false)
      await expect(failTxBuilder.validate()).rejects.toThrowError()
    })
  })

  // test get tx
  describe('getTx', () => {
    test('should get TransactionData', async () => {
      const tx: TransactionData = await txBuilder.getTx()
      expect(tx).not.toBeUndefined()
    })
  })
})
