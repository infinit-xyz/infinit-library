import { BaseError } from '@errors/base'

export class FoundInvalidCachedTxError extends BaseError {
  constructor() {
    super(`Found a successful Tx after a failed Tx, please contract support`, {
      name: 'FoundInvalidCachedTxError',
    })
  }
}

export class IncorrectCacheError extends BaseError {
  constructor(reason = 'None') {
    super([`Found a cache but the cache is incorrect`, `Reason: ${reason}`].join('\n'), {
      name: 'IncorrectCacheError',
    })
  }
}
