import { Address, Hex, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializePendlePYLpOracleTxBuilderParams = {
  pendlePYLpOracle: Address
  blockCycleNumerator: number
}
export class InitializePendlePYLpOracleTxBuilder extends TxBuilder {
  public pendlePYLpOracle: Address
  public blockCycleNumerator: number

  constructor(client: InfinitWallet, params: InitializePendlePYLpOracleTxBuilderParams) {
    super(InitializePendlePYLpOracleTxBuilder.name, client)
    this.pendlePYLpOracle = getAddress(params.pendlePYLpOracle)
    this.blockCycleNumerator = params.blockCycleNumerator
  }

  async buildTx(): Promise<TransactionData> {
    const pendlePYLpOracleArtifact = await readArtifact('PendlePYLpOracle')

    const deployData: Hex = encodeFunctionData({
      abi: pendlePYLpOracleArtifact.abi,
      functionName: 'initialize',
      args: [this.blockCycleNumerator],
    })

    const tx: TransactionData = {
      data: deployData,
      to: this.pendlePYLpOracle,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.blockCycleNumerator < 1000) {
      throw new ValidateInputValueError('BlockCycleNumerator must be greater than 1000')
    }
    if (this.pendlePYLpOracle === zeroAddress) throw new ValidateInputZeroAddressError('PENDLE_PY_LP_ORACLE')
  }
}
