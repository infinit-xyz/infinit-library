import { Hex } from 'viem'

import { BaseError } from '@/errors/base.ts'

export type TransactionErrorType = TransactionError & {
  name: 'TransactionError'
}
export class TransactionError extends BaseError {
  constructor(txHash: Hex) {
    super(`Transaction ${txHash} reverted`, {
      name: 'TransactionError',
    })
  }
}

export type ContractNotFoundErrorType = ContractNotFoundError & {
  name: 'ContractNotFoundError'
}
export class ContractNotFoundError extends BaseError {
  constructor(txHash: Hex, contractName: string = '') {
    super(`Contract ${contractName} not found in ${txHash}`, {
      name: 'ContractNotFoundError',
    })
  }
}

export type TxNotFoundErrorType = TxNotFoundError & {
  name: 'TxNotFoundError'
}
export class TxNotFoundError extends BaseError {
  constructor() {
    super('Transaction not found', {
      name: 'TxNotFoundError',
    })
  }
}
