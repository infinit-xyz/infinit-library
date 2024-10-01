import { BaseError } from '@errors/base.ts'

export type ValidateInputValueErrorType = ValidateInputValueError & {
  name: 'ValidateInputValueError'
}
export class ValidateInputValueError extends BaseError {
  constructor(extraErrorMsg: string = '') {
    super(['Please check your input params', ...(extraErrorMsg ? [extraErrorMsg] : [])].join('\n'), {
      name: 'ValidateInputValueError',
    })
  }
}

export class ValidateLengthError extends ValidateInputValueError {
  constructor() {
    super(`LENGTH_MISMATCH`)
  }
}

export class ValidateInputZeroAddressError extends ValidateInputValueError {
  constructor(param: string) {
    super(`${param} SHOULD_NOT_BE_ZERO_ADDRESS`)
  }
}

export type ValueNotFoundErrorType = ValueNotFoundError & {
  name: 'ValueNotFoundError'
}
export class ValueNotFoundError extends BaseError {
  constructor(extraErrorMsg: string = '') {
    super(['Please check your input params', ...(extraErrorMsg ? [extraErrorMsg] : [])].join('\n'), {
      name: 'ValueNotFoundError',
    })
  }
}
