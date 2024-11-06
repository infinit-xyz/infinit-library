import { Address, Hex } from 'viem'

/**
 * Parameters for on-chain action callbacks.
 */
type OnChainActionCallbackParams = {
  /**
   * Event emitted when an action starts.
   * Information about the action. This includes the name of the action and the total number of sub-actions.
   */
  actionInfo: { name: string; totalSubActions: number }
  /**
   * Event emitted when a transaction is submitted.
   * Contains the name of the transaction, the transaction hash, and the wallet address.
   */
  txSubmitted: { name: string; txHash: Hex; walletAddress: Address }
  /**
   * Event emitted when a transaction is confirmed.
   * Contains the name of the transaction, the transaction hash, and the wallet address.
   */
  txConfirmed: { name: string; txHash: Hex; walletAddress: Address }
  /**
   * Event emitted when a transaction is checked.
   * Contains the transaction hash, the current status of the transaction, and the wallet address.
   * The status can be one of the following: 'CONFIRMED', 'REVERTED', 'PENDING', or 'NOT_FOUND'.
   */
  txChecked: { txHash: Hex; status: 'CONFIRMED' | 'REVERTED' | 'PENDING' | 'NOT_FOUND'; walletAddress: Address }
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
 * Parameters for off-chain action callbacks.
 */
type OffChainActionCallbackParams = {
  /**
   * Parameters for the start event.
   */
  start: {
    /**
     * Message indicating the start of the action.
     */
    message?: string
  }
  /**
   * Parameters for the progress event.
   */
  progress: {
    /**
     * Current progress step.
     */
    currentStep?: number
    /**
     * Total steps for the progress.
     */
    totalSteps?: number
    /**
     * Message indicating the progress of the action.
     */
    message?: string
  }
  /**
   * Parameters for the finish event.
   */
  finish: {
    /**
     * Message indicating the completion of the action.
     */
    message?: string
  }
}

/**
 * Keys for on-chain action callback parameters.
 */
type OnChainActionCallbackKeys = keyof OnChainActionCallbackParams

/**
 * Callback function for on-chain action events.
 *
 * @template T - The type of the callback key.
 * @param key - The key representing the event type.
 * @param value - The value corresponding to the parameters of that event.
 * @returns A promise that resolves when the callback is completed.
 */
type OnChainActionCallback = <T extends OnChainActionCallbackKeys>(key: T, value?: OnChainActionCallbackParams[T]) => Promise<void>

/**
 * Keys for off-chain action callback parameters.
 */
type OffChainActionCallbackKeys = keyof OffChainActionCallbackParams

/**
 * Callback function for off-chain action events.
 *
 * @template T - The type of the callback key.
 * @param key - The key representing the event type.
 * @param value - The value corresponding to the parameters of that event.
 * @returns A promise that resolves when the callback is completed.
 */
type OffChainActionCallback = <T extends OffChainActionCallbackKeys>(key: T, value?: OffChainActionCallbackParams[T]) => Promise<void>

export {
  OffChainActionCallback,
  OffChainActionCallbackKeys,
  OffChainActionCallbackParams,
  OnChainActionCallback,
  OnChainActionCallbackKeys,
  OnChainActionCallbackParams,
}
