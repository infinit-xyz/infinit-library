import { TransactionRequestBase } from 'viem'

/**
 * Basic data needed for a transaction, including 'to', 'value', and 'data' fields.
 */
type TransactionData = Pick<TransactionRequestBase, 'to' | 'value' | 'data'>

/**
 * Represents a transaction to be sent, including its name and data.
 */
type ToSendTransaction = {
  /**
   * The name of the transaction, used for identification.
   */
  name: string
  /**
   * The data required to send the transaction.
   */
  txData: TransactionData
}

export { ToSendTransaction, TransactionData }

export { InfinitAction, InfinitActionRecord } from './action'
export { InfinitCache } from './cache'
export { ActionCallback } from './callback/action'
export { ContractVerifierCallback } from './callback/contractVerifier'
export { OffChainActionCallback } from './callback/offChainAction'
export { InfinitOffChainAction, InfinitOffChainActionRecord } from './offChainAction'
