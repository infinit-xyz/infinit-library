import { ZodError } from 'zod'

import { BaseError } from '@errors/base.ts'

export type ValidateInputValueErrorType = ValidateInputValueError & {
  name: 'ValidateInputValueError'
}
export class ValidateInputValueError extends BaseError {
  public readonly zodError?: ZodError

  constructor(extraErrorMsg: string = '', zodError?: ZodError) {
    super(['Please check your input params', ...(extraErrorMsg ? [extraErrorMsg] : [])].join('\n'), {
      name: 'ValidateInputValueError',
    })
    this.zodError = zodError
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
