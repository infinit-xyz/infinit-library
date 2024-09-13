import { BaseError } from '@/errors/base.ts'

export type ValidateInputValueErrorType = ValidateInputValueError & {
  name: 'ValidateInputValueError'
}
export class ValidateInputValueError extends BaseError {
  constructor(extraErrorMsg: string = '') {
    super(['ValidateInputValueError:', 'Please check your input params', extraErrorMsg].join('\n'), {
      name: 'ValidateInputValueError',
    })
  }
}

export type ValueNotFoundErrorType = ValueNotFoundError & {
  name: 'ValueNotFoundError'
}
export class ValueNotFoundError extends BaseError {
  constructor(extraErrorMsg: string = '') {
    super(['ValueNotFoundError:', 'Please check your input params', extraErrorMsg].join('\n'), {
      name: 'ValueNotFoundError',
    })
  }
}
