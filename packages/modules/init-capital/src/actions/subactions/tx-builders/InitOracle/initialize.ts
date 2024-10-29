import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializeInitOracleProxyTxBuilderParams = {
  initOracle: Address
  logic: Address
  admin: Address
}

export class InitializeInitOracleProxyTxBuilder extends TxBuilder {
  private initOracle: Address
  private logic: Address
  private admin: Address

  constructor(client: InfinitWallet, params: InitializeInitOracleProxyTxBuilderParams) {
    super(InitializeInitOracleProxyTxBuilder.name, client)
    this.initOracle = getAddress(params.initOracle)
    this.logic = getAddress(params.logic)
    this.admin = getAddress(params.admin)
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
    if (this.logic === zeroAddress) throw new ValidateInputValueError('LOGIC_CANNOT_BE_ZERO_ADDRESS')
    if (this.admin === zeroAddress) throw new ValidateInputValueError('ADMIN_CANNOT_BE_ZERO_ADDRESS')
  }
}
