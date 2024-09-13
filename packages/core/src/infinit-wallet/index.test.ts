import { BASE_TRANSACTION_RECEIPT, MOCK_PRIVATE_KEY } from './__mock__/constants.mock'
import { InfinitWallet } from '@infinit-wallet/index'
import { privateKeyToAccount } from 'viem/accounts'
import { linea } from 'viem/chains'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const CHAIN = linea
const rpcEndpoint = 'https://rpc.linea.build'
const account = privateKeyToAccount(MOCK_PRIVATE_KEY)

describe('InfinitWallet', () => {
  let infinitWallet: InfinitWallet

  beforeEach(() => {
    infinitWallet = new InfinitWallet(CHAIN, rpcEndpoint, account)
  })

  test('should handle success transaction', async () => {
    vi.spyOn(infinitWallet.publicClient, 'waitForTransactionReceipt').mockResolvedValue({
      ...BASE_TRANSACTION_RECEIPT,
      status: 'success',
    })

    const res = await infinitWallet.checkTransaction('0x1234')
    expect(res).toBe(true)
  })

  test('should handle reverted transaction', async () => {
    vi.spyOn(infinitWallet.publicClient, 'waitForTransactionReceipt').mockResolvedValue({
      ...BASE_TRANSACTION_RECEIPT,
      status: 'reverted',
    })

    const res = await infinitWallet.checkTransaction('0x1234')
    expect(res).toBe(false)
  })

  test('should fetch transaction data on-chain and handle correctly', async () => {
    const infinitWallet = new InfinitWallet(CHAIN, rpcEndpoint, account)

    const res = await infinitWallet.checkTransaction('0x10ac4ba498382e6280a23740d9d6afeb170586befcce866f3cdf5d1670af7e28')
    expect(res).toBe(true)
  })
})
