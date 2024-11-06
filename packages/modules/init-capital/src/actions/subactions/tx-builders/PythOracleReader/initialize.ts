import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializePythOracleReaderTxBuilderParams = {
  pythOracleReader: Address
  pyth: Address
}

export class InitializePythOracleReaderTxBuilder extends TxBuilder {
  private pythOracleReader: Address
  private pyth: Address

  constructor(client: InfinitWallet, params: InitializePythOracleReaderTxBuilderParams) {
    super(InitializePythOracleReaderTxBuilder.name, client)
    this.pythOracleReader = getAddress(params.pythOracleReader)
    this.pyth = getAddress(params.pyth)
  }

  async buildTx(): Promise<TransactionData> {
    const pythOracleReaderArtifact = await readArtifact('PythOracleReader')
    const functionData = encodeFunctionData({
      abi: pythOracleReaderArtifact.abi,
      functionName: 'initialize',
      args: [this.pyth],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.pythOracleReader,
    }

    return tx
  }

  public async validate(): Promise<void> {
    if (this.pythOracleReader === zeroAddress) throw new ValidateInputZeroAddressError('PYTH_ORACLE_READER')
    if (this.pyth === zeroAddress) throw new ValidateInputZeroAddressError('PYTH')
  }
}
