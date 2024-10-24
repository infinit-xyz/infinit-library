import { OffChainActionCallback } from '@/types'

/**
 * The return type for off-chain actions.
 *
 * @template D - The type of the data returned by the action.
 */
type OffChainActionReturn<D extends object | string | [] | undefined> = {
  /**
   * Optional message providing additional information about the action result.
   */
  message?: string
  /**
   * Optional data returned by the action.
   */
  data: D
}

/**
 * Abstract base class for off-chain actions.
 *
 * @template P - The type of the parameters required by the action.
 * @template D - The type of the data returned by the action.
 */
abstract class OffChainAction<P extends object | undefined = undefined, D extends object | string | [] | undefined = undefined> {
  /**
   * Creates an instance of OffChainAction.
   */
  constructor() {
    this.initialize()
  }

  abstract initialize(): void

  /**
   * Abstract method to run the off-chain action.
   *
   * @param params - The parameters required to run the action.
   * @param callback - Optional callback for action events.
   * @returns A promise that resolves to the result of the action.
   */
  abstract run(params: P, callback?: OffChainActionCallback): Promise<OffChainActionReturn<D>>
}

export { OffChainAction, OffChainActionReturn }
