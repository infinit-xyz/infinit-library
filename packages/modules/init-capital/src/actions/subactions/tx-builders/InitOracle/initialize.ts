import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializeInitOracleTxBuilderParams = {
  initOracle: Address
}

export class InitializeInitOracleTxBuilder extends TxBuilder {
  private initOracle: Address

  constructor(client: InfinitWallet, params: InitializeInitOracleTxBuilderParams) {
    super(InitializeInitOracleTxBuilder.name, client)
    this.initOracle = getAddress(params.initOracle)
  }

  async buildTx(): Promise<TransactionData> {
    const initOracleArtifact = await readArtifact('InitOracle')
    const functionData = encodeFunctionData({
      abi: initOracleArtifact.abi,
      functionName: 'initialize',
      args: [],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.initOracle,
    }

    return tx
  }

  public async validate(): Promise<void> {
    if (this.initOracle === zeroAddress) throw new ValidateInputValueError('INIT_ORACLE_CANNOT_BE_ZERO_ADDRESS')
  }
}
