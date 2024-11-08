import { OnChainActionCallback, TransactionData } from '@/types'

import { InfinitWallet } from '@infinit-wallet/index'

/**
 * Abstract base class for constructing transaction builders.
 *
 * A transaction builder represents a single transaction that can be
 * constructed and validated before being sent.
 */
abstract class TxBuilder {
  /**
   * The name of the transaction builder.
   *
   * @type {string}
   */
  public name: string

  /**
   * The Infinit wallet client associated with this transaction builder.
   *
   * @type {InfinitWallet}
   */
  public client: InfinitWallet

  /**
   * Creates a new instance of the `TxBuilder` class.
   *
   * @param name - The name of the transaction builder.
   * @param client - The Infinit wallet client to be used for this transaction builder.
   */
  constructor(name: string, client: InfinitWallet) {
    this.name = name
    this.client = client
  }

  /**
   * Retrieves the transaction data required for this transaction builder.
   *
   * This method calls the `buildTx` method to generate the transaction data.
   *
   * @param callback - An optional callback function to be executed after the transaction data is retrieved.
   * @returns A promise that resolves with the transaction data for the transaction builder.
   */
  public async getTx(callback?: OnChainActionCallback): Promise<TransactionData> {
    return this.buildTx(callback)
  }

  /**
   * Validates the state of the transaction builder.
   *
   * Subclasses must implement this method to ensure that the transaction
   * builder is in a valid state before attempting to build the transaction.
   * Throws an error if the state is invalid.
   *
   * @returns A promise that resolves when the validation is complete.
   * @throws Error if the state is invalid.
   */
  public abstract validate(): Promise<void>

  /**
   * Builds the transaction data to be sent for this transaction builder.
   *
   * Subclasses must implement this method to generate the actual transaction
   * data based on the specific requirements of the transaction builder.
   *
   * @param callback - An optional callback function to be executed after the transaction data is built.
   * @returns A promise that resolves with the transaction data for the transaction builder.
   */
  protected abstract buildTx(callback?: OnChainActionCallback): Promise<TransactionData>
}

export { TxBuilder }
