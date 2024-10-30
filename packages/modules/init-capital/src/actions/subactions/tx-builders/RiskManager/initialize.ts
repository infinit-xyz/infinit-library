import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializeRiskManagerTxBuilderParams = {
  riskManager: Address
}

export class InitializeRiskManagerTxBuilder extends TxBuilder {
  private riskManager: Address

  constructor(client: InfinitWallet, params: InitializeRiskManagerTxBuilderParams) {
    super(InitializeRiskManagerTxBuilder.name, client)
    this.riskManager = getAddress(params.riskManager)
  }

  async buildTx(): Promise<TransactionData> {
    const riskManagerArtifact = await readArtifact('RiskManager')
    const functionData = encodeFunctionData({
      abi: riskManagerArtifact.abi,
      functionName: 'initialize',
      args: [],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.riskManager,
    }

    return tx
  }

  public async validate(): Promise<void> {
    if (this.riskManager === zeroAddress) throw new ValidateInputZeroAddressError('RISK_MANAGER_CANNOT_BE_ZERO_ADDRESS')
  }
}
