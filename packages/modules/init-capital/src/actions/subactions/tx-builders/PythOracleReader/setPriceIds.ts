import { Address, Hex, encodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError, ValidateLengthError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetPriceIdsTxBuilderParams = {
  pythOracleReader: Address
  tokens: Address[]
  priceIds: Hex[]
}

export class SetPriceIdsTxBuilder extends TxBuilder {
  pythOracleReader: Address
  tokens: Address[]
  priceIds: Hex[]

  constructor(client: InfinitWallet, params: SetPriceIdsTxBuilderParams) {
    super(SetPriceIdsTxBuilder.name, client)
    this.pythOracleReader = getAddress(params.pythOracleReader)
    this.tokens = params.tokens.map((token) => getAddress(token))
    this.priceIds = params.priceIds
  }

  async buildTx(): Promise<TransactionData> {
    const pythOracleReaderArtifact = await readArtifact('PythOracleReader')

    const callData = encodeFunctionData({
      abi: pythOracleReaderArtifact.abi,
      functionName: 'setPriceIds',
      args: [this.tokens, this.priceIds],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.pythOracleReader,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // check zero address
    if (this.pythOracleReader === zeroAddress) {
      throw new ValidateInputZeroAddressError('PYTH_ORACLE_READER')
    }

    // check length of tokens and priceIds
    if (this.tokens.length != this.priceIds.length) {
      throw new ValidateLengthError()
    }

    // get artifacts
    const [pythOracleReaderArtifact, acmArtifact] = await Promise.all([
      readArtifact('PythOracleReader'),
      readArtifact('AccessControlManager'),
    ])

    // check role
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
