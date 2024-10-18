import {
  Account,
  Chain,
  Hash,
  Hex,
  PublicClient,
  TransactionReceipt,
  Transport,
  WalletClient,
  createPublicClient,
  createWalletClient,
  http,
} from 'viem'

import { InfinitCallback, ToSendTransaction } from '@/types'

import { TransactionError } from '@errors/index'

/**
 * A class that represents an Infinit Wallet, which allows interacting with blockchain accounts,
 * sending transactions, and checking transaction statuses.
 */
export class InfinitWallet {
  /**
   * The wallet client used for interacting with the user's wallet, handling transaction signing
   * and other wallet-related operations.
   */
  walletClient: WalletClient<Transport, Chain, Account>

  /**
   * The public client used for reading blockchain data and monitoring transaction statuses.
   */
  publicClient: PublicClient

  /**
   * The blockchain account associated with the wallet.
   * @deprecated Use `walletClient.account` instead for accessing the account information.
   */
  account: Account

  /**
   * Creates a new instance of the Infinit Wallet.
   *
   * @param chain - The blockchain chain to connect to, such as Ethereum or a testnet.
   * @param rpcEndpoint - The RPC endpoint URL used to communicate with the blockchain.
   * @param account - The blockchain account that will be managed by this wallet.
   */
  constructor(chain: Chain, rpcEndpoint: string, account: Account) {
    this.walletClient = createWalletClient({
      chain,
      transport: http(rpcEndpoint),
      account,
    })

    this.publicClient = createPublicClient({
      chain,
      transport: http(rpcEndpoint),
    })

    this.account = account
  }

  /**
   * Sends a batch of transactions through the wallet client.
   *
   * @param transactions - An array of transactions to be sent, each containing its name and data.
   * @param callback - An optional callback function that is called after each transaction is submitted and confirmed.
   *                   The callback receives the status of the transaction ('txSubmitted' or 'txConfirmed') and details including
   *                   the transaction name and hash.
   * @returns A promise that resolves to an array of transaction receipts, providing details about each completed transaction.
   * @throws {TransactionError} If any transaction fails, the function throws a `TransactionError` with the failed transaction's hash.
   */
  sendTransactions = async (transactions: ToSendTransaction[], callback?: InfinitCallback): Promise<TransactionReceipt[]> => {
    const txReceipts: TransactionReceipt[] = []

    for (const transaction of transactions) {
      const walletAddress = this.walletClient.account.address
      // Send the transaction using the wallet client and get the transaction hash
      const txHash: Hash = await this.walletClient.sendTransaction({
        ...transaction.txData,
        chain: this.walletClient.chain,
      })

      // Notify the callback that the transaction has been submitted
      await callback?.('txSubmitted', { name: transaction.name, txHash, walletAddress })

      // Wait for the transaction to be confirmed and get the receipt
      const txReceipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash })

      // Check if the transaction was successful; throw an error if not
      if (txReceipt.status !== 'success') {
        throw new TransactionError(txHash)
      }

      // Notify the callback that the transaction has been confirmed
      await callback?.('txConfirmed', { name: transaction.name, txHash, walletAddress })

      // Add the transaction receipt to the array of receipts
      txReceipts.push(txReceipt)
    }

    return txReceipts
  }

  /**
   * Checks whether a transaction was successful.
   *
   * @param txHash - The hash of the transaction to check.
   * @returns A promise that resolves to `true` if the transaction was successful, or `false` otherwise.
   */
  checkTransaction = async (txHash: Hex): Promise<boolean> => {
    const txReceipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    })

    return txReceipt.status === 'success'
  }
}
