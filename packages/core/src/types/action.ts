import { ZodObject } from 'zod'

/**
 * Base details for an action.
 */
type BaseActionDetail = {
  /**
   * The type of the action, either 'on-chain' or 'off-chain'.
   */
  type: 'on-chain' | 'off-chain'
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
   * The type of the action, which is 'on-chain'.
   */
  type: 'on-chain'
  /**
   * Signers for the action.
   */
  signers: string[]
}

/**
 * Details for an off-chain action.
 */
type OffChainActionDetail = BaseActionDetail & {
  /**
   * The type of the action, which is 'off-chain'.
   */
  type: 'off-chain'
}

/**
 * Record of action details, which can be either on-chain or off-chain.
 */
type ActionDetailRecord = Record<string, OnChainActionDetail | OffChainActionDetail>

export { ActionDetailRecord, BaseActionDetail, OffChainActionDetail, OnChainActionDetail }
