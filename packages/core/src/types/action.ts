import { ZodObject } from 'zod'

/**
 * An Infinit action.
 */
type InfinitAction = {
  /**
   * Name of the action.
   */
  name: string
  /**
   * Class name of the action.
   */
  actionClassName: string
  /**
   * Schema for the action parameters.
   */
  paramsSchema: ZodObject<any>
  /**
   * Signers for the action.
   */
  signers: string[]
}

/**
 * Record of Infinit actions.
 */
type InfinitActionRecord = Record<string, InfinitAction>

export { InfinitAction, InfinitActionRecord }
