import { Hex } from 'viem'

/**
 * Represents a single transaction with its name and unique identifier.
 *
 * @typedef {Object} TransactionCache
 * @property {string} name - The name or label of the transaction, used for identification and description.
 * @property {Hex} txHash - The unique hash of the transaction in hexadecimal format, used for tracking and referencing.
 */
type TransactionCache = {
  /**
   * The name of the transaction.
   *
   * Provides a descriptive label for identifying and distinguishing the transaction.
   *
   * @type {string}
   */
  name: string

  /**
   * The unique identifier of the transaction.
   *
   * This hash is represented in hexadecimal format and is used to track and reference the transaction uniquely.
   *
   * @type {Hex}
   */
  txHash: Hex
}

/**
 * Represents the cache data for a sub-action, including its name and the transactions associated with it.
 *
 * @typedef {Object} SubActionCache
 * @property {string} name - The name of the sub-action, which identifies and describes the sub-action within a broader action context.
 * @property {TransactionCache[]} transactions - Array of transactions associated with this sub-action. Each transaction is represented by a `TransactionCache` object.
 */
type SubActionCache = {
  /**
   * The name of the sub-action.
   *
   * This string uniquely identifies and describes the sub-action within the context of the broader action.
   *
   * @type {string}
   */
  name: string

  /**
   * Array of transactions related to this sub-action.
   *
   * Each transaction is represented by a `TransactionCache` object, which includes details such as the transaction's name and hash.
   *
   * @type {TransactionCache[]}
   */
  transactions: TransactionCache[]
}

/**
 * Represents a comprehensive cache for an Infinit action, including its name,
 * associated sub-actions, and an optional message.
 *
 * @typedef {Object} InfinitCache
 * @property {string} [name] - Optional name of the main action. This label helps identify the primary action.
 * @property {SubActionCache[]} [subActions] - Optional array of sub-actions associated with the main action. Each sub-action is described by a `SubActionCache` object.
 * @property {string} [message] - Optional message providing additional context or details about the main action.
 */
type InfinitCache = {
  /**
   * The name of the main action.
   *
   * This optional string serves as a descriptive label for identifying the primary action.
   *
   * @type {string}
   */
  name: string

  /**
   * Array of sub-actions related to the main action.
   *
   * Each sub-action is represented by a `SubActionCache` object. This field is optional and can be empty if no sub-actions are defined.
   *
   * @type {SubActionCache[]}
   */
  subActions?: SubActionCache[]

  /**
   * Optional message associated with the main action.
   *
   * Provides additional context or details about the action, if needed.
   *
   * @type {string}
   */
  message?: string
}

export { InfinitCache, SubActionCache, TransactionCache }
