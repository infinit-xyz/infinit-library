import { ZodObject } from 'zod'

/**
 * Represents an off-chain action in the Infinit system.
 */
type InfinitOffChainAction = {
  /**
   * The name of the action.
   */
  name: string
  /**
   * The class name of the action.
   */
  offChainActionClassName: string
  /**
   * The schema for the action parameters.
   */
  paramsSchema: ZodObject<any>
}

/**
 * A record of Infinit off-chain actions, where the key is the action name and the value is the action details.
 */
type InfinitOffChainActionRecord = Record<string, InfinitOffChainAction>

export { InfinitOffChainAction, InfinitOffChainActionRecord }
