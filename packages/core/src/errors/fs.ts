import { BaseError } from '@errors/base.ts'

export type DirectoryNotFoundErrorType = DirectoryNotFoundError & {
  name: 'DirectoryNotFoundError'
}
export class DirectoryNotFoundError extends BaseError {
  constructor(path: string) {
    super(`${path} not found`, {
      name: 'DirectoryNotFoundError',
    })
  }
}
