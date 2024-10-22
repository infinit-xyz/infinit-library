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

export { OffChainActionCallback, OffChainActionCallbackKeys, OffChainActionCallbackParams }
