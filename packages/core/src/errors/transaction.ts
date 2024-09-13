import { BaseError } from '@/errors/base.ts'

import { Hex } from 'viem'

export type TransactionErrorType = TransactionError & {
  name: 'TransactionError'
}
export class TransactionError extends BaseError {
  constructor(txHash: Hex) {
    super([`tx ${txHash} reverted`].join('\n'), {
      name: 'TransactionError',
    })
  }
}

export type ContractNotFoundErrorType = ContractNotFoundError & {
  name: 'ContractNotFoundError'
}
export class ContractNotFoundError extends BaseError {
  constructor(txHash: Hex, contractName: string = '') {
    super([`Contract:${contractName} not found in ${txHash}.`].join('\n'), {
      name: 'ContractNotFoundError',
    })
  }
}

export type TxNotFoundErrorType = TxNotFoundError & {
  name: 'TxNotFoundError'
}
export class TxNotFoundError extends BaseError {
  constructor() {
    super([`Transaction not found.`].join('\n'), {
      name: 'TxNotFoundError',
    })
  }
}
