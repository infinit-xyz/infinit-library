import { ZodObject } from 'zod'

/**
 * Base details for an action.
 */
type BaseActionDetail = {
  /**
   * The name of the action.
   */
  name: string
  /**
   * The class name of the action.
   */
  actionClassName: string
  /**
   * The schema for the action parameters.
   */
  paramsSchema: ZodObject<any>
}

/**
 * Details for an on-chain action.
 */
type OnChainActionDetail = BaseActionDetail & {
  /**
   * Signers for the action.
   */
  signers: string[]
}

/**
 * Details for an off-chain action.
 */
type OffChainActionDetail = BaseActionDetail

/**
 * Record of on-chain actions.
 */
type OnChainActionRecord = Record<string, OnChainActionDetail>

/**
 * Record of off-chain actions.
 */
type OffChainActionRecord = Record<string, OffChainActionDetail>

export { BaseActionDetail, OffChainActionDetail, OffChainActionRecord, OnChainActionDetail, OnChainActionRecord }
