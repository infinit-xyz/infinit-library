import { Address, encodeDeployData, getAddress, Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployInitOracleTxBuilderParams {
  accessControlManager: Address
}

export class DeployInitOracleTxBuilder extends TxBuilder {
  private accessControlManager: Address
  
  constructor(client: InfinitWallet, params: DeployInitOracleTxBuilderParams) {
    super(DeployInitOracleTxBuilder.name, client)
    this.accessControlManager = getAddress(params.accessControlManager)
  }

  async buildTx(): Promise<TransactionData> {
    const initOracleArtifact = await readArtifact('InitOracle')

    const deployData: Hex = encodeDeployData({
      abi: initOracleArtifact.abi,
      bytecode: initOracleArtifact.bytecode as Hex,
      args: [this.accessControlManager],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
