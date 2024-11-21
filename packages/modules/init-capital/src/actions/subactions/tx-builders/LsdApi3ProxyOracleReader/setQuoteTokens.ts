import { Address, encodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError, ValidateLengthError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetQuoteTokensTxBuilderParams = {
  lsdApi3ProxyOracleReader: Address
  tokens: Address[]
  quoteTokens: Address[]
}

export class SetQuoteTokensTxBuilder extends TxBuilder {
  lsdApi3ProxyOracleReader: Address
  tokens: Address[]
  quoteTokens: Address[]

  constructor(client: InfinitWallet, params: SetQuoteTokensTxBuilderParams) {
    super(SetQuoteTokensTxBuilder.name, client)
    this.lsdApi3ProxyOracleReader = getAddress(params.lsdApi3ProxyOracleReader)
    this.tokens = params.tokens.map((token) => getAddress(token))
    this.quoteTokens = params.quoteTokens.map((quoteToken) => getAddress(quoteToken))
  }

  async buildTx(): Promise<TransactionData> {
    const lsdApi3ProxyOracleReaderArtifact = await readArtifact('LsdApi3ProxyOracleReader')

    const callData = encodeFunctionData({
      abi: lsdApi3ProxyOracleReaderArtifact.abi,
      functionName: 'setQuoteTokens',
      args: [this.tokens, this.quoteTokens],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.lsdApi3ProxyOracleReader,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // check zero address
    if (this.lsdApi3ProxyOracleReader === zeroAddress) {
      throw new ValidateInputZeroAddressError('LSD_API3_PROXY_ORACLE_READER')
    }

    // check length of tokens and dataFeedProxies
    if (this.tokens.length != this.quoteTokens.length) {
      throw new ValidateLengthError()
    }

    // get artifacts
    const [lsdApi3ProxyOracleReaderArtifact, acmArtifact] = await Promise.all([
      readArtifact('LsdApi3ProxyOracleReader'),
      readArtifact('AccessControlManager'),
    ])

    // check role
    const acm: Address = await this.client.publicClient.readContract({
      address: this.lsdApi3ProxyOracleReader,
      abi: lsdApi3ProxyOracleReaderArtifact.abi,
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
