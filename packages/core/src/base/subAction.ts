import { Hex } from 'viem'

import { TxBuilder } from '@base/txBuilder'

import { OnChainActionCallback, ToSendTransaction } from '@/types'
import { SubActionCache, TransactionCache } from '@/types/cache'

import { FoundInvalidCachedTxError, IncorrectCacheError, TxNotFoundError } from '@errors/index'
import { InfinitWallet } from '@infinit-wallet/index'

/**
 * Represents optional data associated with a sub-action, including any cached
 * information that may be used during the execution process.
 *
 * @typedef {Object} SubActionData
 * @property {SubActionCache} [cache] - Optional cache data for the sub-action,
 * including the name and transactions related to it.
 */
type SubActionData = {
  /**
   * Optional cache data for the sub-action.
   *
   * This property may include the sub-action's name and an array of transactions.
   * It is used to manage and execute the sub-action efficiently, utilizing previously
   * cached information.
   *
   * @type {SubActionCache}
   */
  cache?: SubActionCache
}

/**
 * Response object returned by the `execute` method of a sub-action.
 *
 * This object contains the updated registry and any optional messages resulting
 * from the execution of the sub-action.
 *
 * @template R - Type of the updated registry.
 * @template M - Type of the optional new message.
 */
type SubActionExecuteResponse<R = {}, M = {}> = {
  /**
   * The updated registry after the sub-action is executed.
   *
   * @type {R}
   */
  newRegistry: R

  /**
   * Optional new message resulting from the execution.
   *
   * Provides additional context or details that may be relevant after execution.
   *
   * @type {M}
   */
  newMessage?: M
}

/**
 * Abstract base class for sub-actions that involve executing a series of
 * transactions in a specific order. This class handles the execution flow,
 * validation, caching, and updating the registry as required.
 *
 * Subclasses must implement `setTxBuilders` to define the transaction builders
 * and `updateRegistryAndMessage` to manage registry updates and message generation.
 *
 * @template P - Type of parameters used for the sub-action.
 * @template R - Type of the registry used by the sub-action.
 * @template M - Type of the message associated with the sub-action.
 */
abstract class SubAction<P extends object = {}, R extends object = {}, M extends object = {}> {
  /**
   * The name of the sub-action.
   *
   * @type {string}
   */
  public name: string

  /**
   * The Infinit wallet client used for interacting with blockchain transactions.
   *
   * @type {InfinitWallet}
   */
  public client: InfinitWallet

  /**
   * Parameters for transaction builders.
   *
   * @type {P}
   */
  public params: P

  /**
   * List of transaction builders for this sub-action.
   *
   * @type {TxBuilder[]}
   */
  public txBuilders: TxBuilder[] = []

  /**
   * Creates an instance of `SubAction`, initializing it with the provided name, client,
   * and parameters. Automatically sets transaction builders by calling the
   * `setTxBuilders` method.
   *
   * @param name - The name of the sub-action.
   * @param client - The Infinit wallet client for blockchain interactions.
   * @param params - Parameters for transaction builders.
   */
  constructor(name: string, client: InfinitWallet, params: P) {
    this.name = name
    this.client = client
    this.params = params

    this.setTxBuilders()
  }

  /**
   * Checks the cache to determine the index of the next `TxBuilder` to execute.
   *
   * This method iterates through cached transaction hashes to verify their status.
   * It throws errors if a failed transaction is followed by a successful one or if a
   * transaction hash is missing.
   *
   * @param transactionCaches - Optional array of cached transactions.
   * @param callback - Optional callback for providing updates on transaction status.
   * @returns A promise that resolves with the index of the next `TxBuilder` to execute.
   * @throws {TxNotFoundError} If a transaction hash is missing.
   * @throws {FoundInvalidCachedTxError} If a failed transaction is followed by a successful one.
   */
  public async checkCache(transactionCaches?: TransactionCache[], callback?: OnChainActionCallback): Promise<number> {
    let failedIdx: number | undefined = undefined
    const txHashes: (Hex | undefined)[] = transactionCaches?.map((tx) => tx.txHash) ?? []

    for (let idx = 0; idx < txHashes.length; ++idx) {
      const txHash = txHashes[idx]

      if (!txHash) {
        throw new TxNotFoundError()
      }

      const isTxSuccess = await this.client.checkTransaction(txHash)
      const walletAddress = this.client.walletClient.account.address

      await callback?.('txChecked', { txHash: txHash, status: isTxSuccess ? 'CONFIRMED' : 'REVERTED', walletAddress })

      if (!isTxSuccess) {
        failedIdx = idx
      } else if (failedIdx !== undefined) {
        throw new FoundInvalidCachedTxError()
      }
    }

    return failedIdx ?? txHashes.length
  }

  /**
   * Executes the `TxBuilders` associated with this sub-action.
   *
   * This method determines the starting index for `TxBuilders` from the cache and
   * executes transactions sequentially. It handles transaction submission and updates
   * the registry based on the results of the transactions.
   *
   * @param registry - The current registry that will be updated.
   * @param data - Optional data including cache information.
   * @param callback - Optional callback for status updates during execution.
   * @returns A promise resolving to an object containing the updated registry and an optional new message.
   */
  public async execute(registry: R, data?: SubActionData, callback?: OnChainActionCallback): Promise<SubActionExecuteResponse<R, M>> {
    await callback?.('subActionStarted', { name: this.name })

    const { cache } = data ?? {}

    // Verify that the cache's name matches the expected sub-action name.
    // Throws an `IncorrectCacheError` if the cache name does not match the expected sub-action name.
    if (cache && cache.name !== this.name) {
      throw new IncorrectCacheError(`SubAction name is incorrect (expected: ${this.name}, got: ${cache.name})`)
    }

    // Determine the starting index for TxBuilders based on cache.
    const startIndex = await this.checkCache(cache?.transactions, callback)

    const toSendTxs: ToSendTransaction[] = []
    let txHashes: Hex[] = cache?.transactions.map((tx) => tx.txHash) ?? []

    // Remove failed transactions from the list.
    txHashes = txHashes.slice(0, startIndex)

    for (let i = startIndex; i < this.txBuilders.length; ++i) {
      const txBuilder = this.txBuilders[i]

      const tx = await txBuilder.getTx(callback)

      toSendTxs.push({ name: txBuilder.name, txData: tx })
    }
    if (toSendTxs.length > 0) {
      // Submit transactions and collect new transaction hashes.
      const newTxs = await this.client.sendTransactions(toSendTxs, callback)

      txHashes = [...txHashes, ...newTxs.map((tx) => tx.transactionHash)]
    }

    // TODO: Await confirmation of all transactions before proceeding.

    // Update registry and create any necessary messages.
    const updatedData = await this.updateRegistryAndMessage(registry, txHashes)

    await callback?.('subActionFinished', { name: this.name })

    return updatedData
  }

  /**
   * Validates the sub-action and its transaction builders.
   *
   * Subclasses may override this method to implement custom validation logic.
   *
   * @param registry - The current registry used for validation.
   * @throws Throws an error if validation fails.
   */
  public async validate(_registry?: R): Promise<void> {
    await this.internalValidate(_registry)

    for (const txBuilder of this.txBuilders) {
      await txBuilder.validate()
    }
  }

  /**
   * Internal validation logic for the sub-action.
   *
   * Subclasses can override this method to include additional validation logic specific
   * to their needs. By default, this method performs no actions.
   *
   * @param registry - The current registry used for validation.
   */
  protected async internalValidate(_registry?: R): Promise<void> {
    // Default implementation does nothing.
    return
  }

  /**
   * Abstract method to set transaction builders.
   *
   * Subclasses must implement this method to define and configure the transaction builders
   * required for the sub-action.
   */
  protected abstract setTxBuilders(): void

  /**
   * Abstract method for updating the registry and creating runtime messages.
   *
   * Subclasses must implement this method to handle updates to the registry and generate
   * any necessary messages based on the outcomes of the transactions.
   *
   * @param registry - The current registry to be updated.
   * @param txHashes - Array of transaction hashes associated with this sub-action.
   * @returns A promise resolving to an object containing the updated registry and optional new message.
   */
  protected abstract updateRegistryAndMessage(registry: R, txHashes: Hex[]): Promise<SubActionExecuteResponse<R, M>>
}

export { SubAction, SubActionData, SubActionExecuteResponse }
