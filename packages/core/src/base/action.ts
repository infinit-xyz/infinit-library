import { SubAction } from '@base/subAction'

import { InfinitCache } from '@/types'
import { OnChainActionCallback, OnChainActionCallbackParams } from '@/types/callback/action'

import { IncorrectCacheError } from '@errors/index'
import { InfinitWallet } from '@infinit-wallet/index'

/**
 * Represents the data associated with an action.
 *
 * This type defines the structure of the data required for an action,
 * including parameters and signer information.
 */
type ActionData = {
  /**
   * Parameters for the action.
   *
   * @type {Object}
   */
  params: object

  /**
   * Signers for the action, represented as a record where each key
   * is associated with an `InfinitWallet` instance.
   *
   * @type {Record<string, InfinitWallet>}
   */
  signer: Record<string, InfinitWallet>
}

/**
 * Maps clients to the keys of the signers from `ActionData`.
 *
 * @template D - Type of the data associated with the action, which extends `ActionData`.
 * @type {Record<keyof D['signer'], InfinitWallet>}
 */
type ActionClients<D extends ActionData> = Record<keyof D['signer'], InfinitWallet>

/**
 * Base class for defining actions in a sequence of sub-actions.
 *
 * This class manages the execution flow of sub-actions, including
 * validation, caching, and updating the registry. Subclasses must
 * define specific sub-actions via the `getSubActions` method.
 *
 * @template D - Type of the data associated with the action, which defaults to `{ params: {}; signer: {} }`.
 * @template R - Type of the registry used by the action, which defaults to `{}`.
 */
abstract class Action<D extends ActionData = { params: {}; signer: {} }, R extends object = {}> {
  /**
   * The name of the action.
   *
   * @type {string}
   */
  public name: string

  /**
   * Data associated with the action, including parameters and signers.
   *
   * @type {D}
   * @protected
   */
  protected data: D

  /**
   * Creates a new instance of the `Action` class.
   *
   * @param name - The name of the action.
   * @param data - Data associated with the action, including parameters and signers.
   */
  constructor(name: string, data: D) {
    this.name = name
    this.data = data
  }

  /**
   * Retrieves information about the action, including its name and the total number of sub-actions.
   *
   * @param subActions - An array of sub-actions or functions returning sub-actions.
   * @returns An object containing the action information, including the name and the total number of sub-actions.
   * @private
   */
  private getActionInfo(
    subActions: SubAction<any, R, {}>[] | ((message?: object) => SubAction<any, R>)[],
  ): OnChainActionCallbackParams['actionInfo'] {
    return {
      name: this.name,
      totalSubActions: subActions.length,
    }
  }

  /**
   * Executes the action by running each sub-action in sequence.
   *
   * The execution involves validating sub-actions, handling cache data,
   * and updating the registry as sub-actions are performed.
   *
   * @param registry - The current project registry that will be updated by the action.
   * @param cache - Optional cache object for temporary data, such as transaction hashes.
   * @param callback - Optional callback function for communicating data during execution.
   * @returns A promise that resolves with the updated registry after all sub-actions have been executed.
   * @throws {IncorrectCacheError} If the cache name does not match the expected action name.
   */
  public async run(registry: R, cache?: InfinitCache, callback?: OnChainActionCallback): Promise<R> {
    let currentMessages = {}
    let currentRegistry: R = { ...registry }

    // Verify that the cache's name matches the expected action name.
    // Throws an `IncorrectCacheError` if the cache name does not match the expected action name.
    if (cache && cache.name !== this.name) {
      throw new IncorrectCacheError(`Action name is incorrect (expected: ${this.name}, got: ${cache.name})`)
    }

    const subActions = this.getSubActions(registry)

    if (callback) {
      await callback('actionInfo', this.getActionInfo(subActions))
    }

    for (let idx = 0; idx < subActions.length; ++idx) {
      const _subAction = subActions[idx]
      const subAction: SubAction<any, R> = typeof _subAction === 'function' ? _subAction(currentMessages) : _subAction

      await subAction.validate(currentRegistry)

      const { newRegistry, newMessage } = await subAction.execute(currentRegistry, { cache: cache?.subActions?.[idx] }, callback)

      currentMessages = { ...currentMessages, ...(newMessage ?? {}) }
      currentRegistry = newRegistry
    }

    return currentRegistry
  }

  /**
   * Defines the sequence of sub-actions for the action.
   *
   * Subclasses must implement this method to specify the sub-actions
   * that make up the action.
   *
   * @param registry - The current project registry.
   * @returns An array of sub-actions or functions that return sub-actions.
   * @protected
   * @abstract
   */
  protected abstract getSubActions<M extends object>(registry: R): SubAction<any, R>[] | ((message?: M) => SubAction<any, R>)[]
}

export { Action, ActionClients, ActionData }
