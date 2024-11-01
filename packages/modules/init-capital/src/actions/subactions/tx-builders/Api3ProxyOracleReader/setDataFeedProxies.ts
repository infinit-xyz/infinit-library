import { Address, encodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetDataFeedProxiesTxBuilderParams = {
  api3ProxyOracleReader: Address
  tokens: Address[]
  dataFeedProxies: Address[]
}

export class SetDataFeedProxiesTxBuilder extends TxBuilder {
  api3ProxyOracleReader: Address
  tokens: Address[]
  dataFeedProxies: Address[]

  constructor(client: InfinitWallet, params: SetDataFeedProxiesTxBuilderParams) {
    super(SetDataFeedProxiesTxBuilder.name, client)
    this.api3ProxyOracleReader = getAddress(params.api3ProxyOracleReader)
    this.tokens = params.tokens.map((token) => getAddress(token))
    this.dataFeedProxies = params.dataFeedProxies.map((dataFeedProxy) => getAddress(dataFeedProxy))
  }

  async buildTx(): Promise<TransactionData> {
    const api3ProxyOracleReaderArtifact = await readArtifact('Api3ProxyOracleReader')

    const callData = encodeFunctionData({
      abi: api3ProxyOracleReaderArtifact.abi,
      functionName: 'setDataFeedProxies',
      args: [this.tokens, this.dataFeedProxies],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.api3ProxyOracleReader,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.api3ProxyOracleReader === zeroAddress) {
      throw new ValidateInputZeroAddressError('API3_PROXY_ORACLE_READER')
    }

    const [api3ProxyOracleReaderArtifact, acmArtifact] = await Promise.all([
      readArtifact('Api3ProxyOracleReader'),
      readArtifact('AccessControlManager'),
    ])
    const acm: Address = await this.client.publicClient.readContract({
      address: this.api3ProxyOracleReader,
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
