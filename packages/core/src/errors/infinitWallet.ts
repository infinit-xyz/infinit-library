import { BaseError } from '@/errors/base.ts'

export type InfinitWalletNotFoundErrorType = InfinitWalletNotFoundError & {
  name: 'InfinitWalletNotFoundError'
}
export class InfinitWalletNotFoundError extends BaseError {
  constructor() {
    super(`InfinitWallet not found`, {
      name: 'InfinitWalletNotFoundError',
    })
  }
}
