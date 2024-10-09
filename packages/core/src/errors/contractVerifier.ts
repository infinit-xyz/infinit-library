import { Address } from 'viem'

import { BaseError } from '@errors/base.ts'

export class VerifyContractError extends BaseError {
  constructor(contractName: string, contractAddress: Address, error?: any) {
    const errorDetails = [`Failed to verify contract ${contractName} on the block explorer at contract address: ${contractAddress}`]

    if (error) {
      errorDetails.push(`Error: ${error}`)
    }

    super(errorDetails.join('\n'), {
      name: VerifyContractError.name,
    })
  }
}

export class GetContractInfoError extends BaseError {
  constructor(contractAddress: Address, error?: any) {
    const errorDetails = [`Failed to get contract information for ${contractAddress}`]

    if (error) {
      errorDetails.push(`Error: ${error}`)
    }

    super(errorDetails.join('\n'), {
      name: GetContractInfoError.name,
    })
  }
}
