import { Hex } from 'viem'

/**
 * Parameters for callbacks.
 */
type CallbackParams = {
  /**
   * Event emitted when an action starts.
   * Information about the action. This includes the name of the action and the total number of sub-actions.
   */
  actionInfo: { name: string; totalSubActions: number }
  /**
   * Event emitted when a transaction is submitted.
   * Contains the name of the transaction and the transaction hash.
   */
  txSubmitted: { name: string; txHash: Hex }
  /**
   * Event emitted when a transaction is confirmed.
   * Contains the name of the transaction and the transaction hash.
   */
  txConfirmed: { name: string; txHash: Hex }
  /**
   * Event emitted when a transaction is checked.
   * Contains the transaction hash and the current status of the transaction, which can be one of the following: 'CONFIRMED', 'REVERTED', 'PENDING', or 'NOT_FOUND'.
   */
  txChecked: { txHash: Hex; status: 'CONFIRMED' | 'REVERTED' | 'PENDING' | 'NOT_FOUND' }
  /**
   * Event emitted when a sub-action starts.
   * Contains the name of the sub-action.
   */
  subActionStarted: { name: string }
  /**
   * Event emitted when a sub-action finishes.
   * Contains the name of the sub-action.
   */
  subActionFinished: { name: string }
}

/**
 * Keys for callback parameters.
 */
type CallbackKeys = keyof CallbackParams

/**
 * Callback function for Infinit events.
 * Accepts a key representing the event type and a value corresponding to the parameters of that event.
 * Returns a promise that resolves when the callback is completed.
 */
type InfinitCallback = <T extends CallbackKeys>(key: T, value: CallbackParams[T]) => Promise<void>

export { CallbackKeys, CallbackParams, InfinitCallback }
