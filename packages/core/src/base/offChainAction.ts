import { OffChainActionCallback } from '@/types/callback/action'

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
   * Data returned by the action.
   */
  data: D
}

/**
 * Abstract base class for off-chain actions.
 *
 * @template R - The type of the registry object.
 * @template P - The type of the parameters required by the action.
 * @template D - The type of the data returned by the action.
 */
abstract class OffChainAction<
  R extends object,
  P extends object | undefined = undefined,
  D extends object | string | [] | undefined = undefined,
> {
  /**
   * The name of the off-chain action.
   * Should be overridden by the child class.
   */
  public name: string = 'OffChainAction'

  /**
   * Abstract method to run the off-chain action.
   *
   * @param registry - The registry object required to run the action.
   * @param params - The parameters required to run the action.
   * @param callback - Optional callback for action events.
   * @returns A promise that resolves to the result of the action.
   */
  abstract run(registry: R, params: P, callback?: OffChainActionCallback): Promise<OffChainActionReturn<D>>
}

export { OffChainAction, OffChainActionReturn }
