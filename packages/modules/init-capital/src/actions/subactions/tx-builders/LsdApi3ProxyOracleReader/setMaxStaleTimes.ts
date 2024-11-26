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
  lsdApi3ProxyOracleReader: Address
  tokens: Address[]
  maxStaleTimes: bigint[]
}

export class SetMaxStaleTimesTxBuilder extends TxBuilder {
  lsdApi3ProxyOracleReader: Address
  tokens: Address[]
  maxStaleTimes: bigint[]

  constructor(client: InfinitWallet, params: SetMaxStaleTimesTxBuilderParams) {
    super(SetMaxStaleTimesTxBuilder.name, client)
    this.lsdApi3ProxyOracleReader = getAddress(params.lsdApi3ProxyOracleReader)
    this.tokens = params.tokens.map((token) => getAddress(token))
    this.maxStaleTimes = params.maxStaleTimes
  }

  async buildTx(): Promise<TransactionData> {
    const api3ProxyOracleReaderArtifact = await readArtifact('LsdApi3ProxyOracleReader')

    const callData = encodeFunctionData({
      abi: api3ProxyOracleReaderArtifact.abi,
      functionName: 'setMaxStaleTimes',
      args: [this.tokens, this.maxStaleTimes],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.lsdApi3ProxyOracleReader,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // lsdApi3ProxyOracleReader should not be zero address
    if (this.lsdApi3ProxyOracleReader === zeroAddress) {
      throw new ValidateInputZeroAddressError('API3_PROXY_ORACLE_READER')
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
    const [api3ProxyOracleReaderArtifact, acmArtifact] = await Promise.all([
      readArtifact('Api3ProxyOracleReader'),
      readArtifact('AccessControlManager'),
    ])
    const acm: Address = await this.client.publicClient.readContract({
      address: this.lsdApi3ProxyOracleReader,
      abi: api3ProxyOracleReaderArtifact.abi,
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
