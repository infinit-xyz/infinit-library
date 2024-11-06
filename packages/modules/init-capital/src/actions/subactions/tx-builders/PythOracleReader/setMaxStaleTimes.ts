import { Address, encodeFunctionData, getAddress, keccak256, maxUint256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import {
  ContractValidateError,
  ValidateInputValueError,
  ValidateInputZeroAddressError,
  ValidateLengthError,
} from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetMaxStaleTimesTxBuilderParams = {
  pythOracleReader: Address
  tokens: Address[]
  maxStaleTimes: bigint[]
}

export class SetMaxStaleTimesTxBuilder extends TxBuilder {
  pythOracleReader: Address
  tokens: Address[]
  maxStaleTimes: bigint[]

  constructor(client: InfinitWallet, params: SetMaxStaleTimesTxBuilderParams) {
    super(SetMaxStaleTimesTxBuilder.name, client)
    this.pythOracleReader = getAddress(params.pythOracleReader)
    this.tokens = params.tokens.map((token) => getAddress(token))
    this.maxStaleTimes = params.maxStaleTimes
  }

  async buildTx(): Promise<TransactionData> {
    const pythOracleReaderArtifact = await readArtifact('PythOracleReader')

    const callData = encodeFunctionData({
      abi: pythOracleReaderArtifact.abi,
      functionName: 'setMaxStaleTimes',
      args: [this.tokens, this.maxStaleTimes],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.pythOracleReader,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // pythOracleReader should not be zero address
    if (this.pythOracleReader === zeroAddress) {
      throw new ValidateInputZeroAddressError('PYTH_ORACLE_READER')
    }

    // check length of tokens and maxStaleTimes
    if (this.tokens.length != this.maxStaleTimes.length) {
      throw new ValidateLengthError()
    }

    // max stale time should be between 0 and maxUint256
    for (const maxStaleTime of this.maxStaleTimes) {
      if (maxStaleTime < 0n || maxStaleTime > maxUint256)
        throw new ValidateInputValueError(`MaxStaleTime should be between 0 and {maxUint256}, found ${maxStaleTime}`)
    }

    // check governor role
    const [pythOracleReaderArtifact, acmArtifact] = await Promise.all([
      readArtifact('PythOracleReader'),
      readArtifact('AccessControlManager'),
    ])
    const acm: Address = await this.client.publicClient.readContract({
      address: this.pythOracleReader,
      abi: pythOracleReaderArtifact.abi,
      functionName: 'ACM',
      args: [],
    })
    const hasRole: boolean = await this.client.publicClient.readContract({
      address: acm,
      abi: acmArtifact.abi,
      functionName: 'hasRole',
      args: [keccak256(toHex('governor')), this.client.walletClient.account.address],
    })
    if (!hasRole) {
      throw new ContractValidateError('NOT_GOVERNOR')
    }
  }
}
