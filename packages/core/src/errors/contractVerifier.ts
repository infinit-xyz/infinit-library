import { Address } from 'viem'

import { BaseError } from '@errors/base.ts'

export class VerifyContractError extends BaseError {
  constructor(contractName: string, contractAddress: Address, message?: string) {
    const errorDetails = [`Failed to verify contract ${contractName} on the block explorer at contract address: ${contractAddress}`]

    if (message) {
      errorDetails.push(`Message: ${message}`)
    }

    super(errorDetails.join('\n'), {
      name: VerifyContractError.name,
    })
  }
}
