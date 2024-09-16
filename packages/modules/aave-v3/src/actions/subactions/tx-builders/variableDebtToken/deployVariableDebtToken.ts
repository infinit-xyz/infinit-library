import { Address, Hex, encodeDeployData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployVariableDebtTokenParams = {
  pool: Address
}

export class DeployVariableDebtTokenTxBuilder extends TxBuilder {
  private pool: Address

  constructor(client: InfinitWallet, params: DeployVariableDebtTokenParams) {
    super(DeployVariableDebtTokenTxBuilder.name, client)
    this.pool = params.pool
  }

  async buildTx(): Promise<TransactionData> {
    const variableDebtTokenArtifact = await readArtifact('VariableDebtToken')

    const deployData: Hex = encodeDeployData({
      abi: variableDebtTokenArtifact.abi,
      bytecode: variableDebtTokenArtifact.bytecode as Hex,
      args: [this.pool],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public validate(): any {}
}
