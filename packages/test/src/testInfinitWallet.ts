import type { Address, Client, Hash, Hex, TestActions, TransactionReceipt, WalletActions } from 'viem'
import { parseEther, walletActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { InfinitWallet, ToSendTransaction } from '@infinit-xyz/core'
import { TransactionError } from '@infinit-xyz/core/errors'

import { testClients } from './client.js'
import { TestChain } from './constants.js'
import { getForkRpcUrl } from './utils.js'

export class TestInfinitWallet extends InfinitWallet {
  public testClient: Client & TestActions & WalletActions
  public impersonatedUser: Address

  constructor(chain: TestChain, impersonatedUser: Address) {
    const testClient = testClients[chain]
    const rpcEndpoint = getForkRpcUrl(chain)
    // anvil private key account
    const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')

    super(testClient.chain!, rpcEndpoint, account)

    this.testClient = testClient.extend(walletActions)
    this.account.address = impersonatedUser
    this.impersonatedUser = impersonatedUser
  }

  override sendTransactions = async (transactions: ToSendTransaction[]): Promise<TransactionReceipt[]> => {
    await this.testClient.impersonateAccount({
      address: this.impersonatedUser,
    })

    // 0. set user balance
    await this.testClient.setBalance({
      address: this.impersonatedUser,
      value: parseEther('100'),
    })

    const txHashes: Hex[] = []
    // 1. Submit all transactions
    for (const transaction of transactions) {
      const tx = transaction.txData
      const hash: Hash = await this.testClient.sendTransaction({
        account: this.impersonatedUser,
        to: tx.to,
        value: tx.value,
        data: tx.data,
        chain: this.publicClient.chain,
      })
      if (!(await this.checkTransaction(hash))) throw new TransactionError(hash)
      txHashes.push(hash)
    }

    // 2. get transaction receipts
    const txReceipts = await Promise.all(txHashes.map((txHash) => this.publicClient.getTransactionReceipt({ hash: txHash })))

    await this.testClient.stopImpersonatingAccount({
      address: this.impersonatedUser,
    })
    return txReceipts
  }
}
