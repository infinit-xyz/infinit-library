import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializeLsdApi3ProxyOracleReaderTxBuilderParams = {
  lsdApi3ProxyOracleReaderProxy: Address
  api3ProxyOracleReader: Address
}

export class InitializeLsdApi3ProxyOracleReaderTxBuilder extends TxBuilder {
  private lsdApi3ProxyOracleReaderProxy: Address
  private api3ProxyOracleReader: Address

  constructor(client: InfinitWallet, params: InitializeLsdApi3ProxyOracleReaderTxBuilderParams) {
    super(InitializeLsdApi3ProxyOracleReaderTxBuilder.name, client)
    this.api3ProxyOracleReader = getAddress(params.api3ProxyOracleReader)
    this.lsdApi3ProxyOracleReaderProxy = getAddress(params.lsdApi3ProxyOracleReaderProxy)
  }

  async buildTx(): Promise<TransactionData> {
    const lsdApi3OracleReaderArtifact = await readArtifact('LsdApi3OracleReader')
    const functionData = encodeFunctionData({
      abi: lsdApi3OracleReaderArtifact.abi,
      functionName: 'initialize',
      args: [this.api3ProxyOracleReader],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.lsdApi3ProxyOracleReaderProxy,
    }

    return tx
  }

  public async validate(): Promise<void> {
    if (this.api3ProxyOracleReader === zeroAddress) throw new ValidateInputZeroAddressError('API3_PROXY_ORACLE_READER')
  }
}
