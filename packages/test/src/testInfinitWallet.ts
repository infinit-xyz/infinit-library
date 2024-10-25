import type { Address, Client, Hash, TestActions, TransactionReceipt, WalletActions } from 'viem'
import { parseEther, walletActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ActionCallback, InfinitWallet, ToSendTransaction } from '@infinit-xyz/core'
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

  override sendTransactions = async (transactions: ToSendTransaction[], callback?: ActionCallback): Promise<TransactionReceipt[]> => {
    await this.testClient.impersonateAccount({
      address: this.impersonatedUser,
    })

    // 0. set user balance
    await this.testClient.setBalance({
      address: this.impersonatedUser,
      value: parseEther('100'),
    })

    const txReceipts: TransactionReceipt[] = []

    for (const transaction of transactions) {
      const walletAddress = this.impersonatedUser
      // Send the transaction using the wallet client and get the transaction hash
      const txHash: Hash = await this.walletClient.sendTransaction({
        ...transaction.txData,
        account: this.impersonatedUser,
        chain: this.walletClient.chain,
      })

      // Notify the callback that the transaction has been submitted
      await callback?.('txSubmitted', { name: transaction.name, txHash, walletAddress })

      // Wait for the transaction to be confirmed and get the receipt
      const txReceipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash })

      // Check if the transaction was successful; throw an error if not
      if (txReceipt.status !== 'success') {
        console.log(`txReceipt.status !== 'success'`)
        throw new TransactionError(txHash)
      }

      // Notify the callback that the transaction has been confirmed
      await callback?.('txConfirmed', { name: transaction.name, txHash, walletAddress })

      // Add the transaction receipt to the array of receipts
      txReceipts.push(txReceipt)
    }

    await this.testClient.stopImpersonatingAccount({
      address: this.impersonatedUser,
    })

    return txReceipts
  }
}
