import { Address, Hex, encodeDeployData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployRiskManagerTxBuilderParams {
  initCore: Address
  accessControlManager: Address
}

export class DeployRiskManagerTxBuilder extends TxBuilder {
  private initCore: Address
  private accessControlManager: Address

  constructor(client: InfinitWallet, params: DeployRiskManagerTxBuilderParams) {
    super(DeployRiskManagerTxBuilder.name, client)
    this.initCore = getAddress(params.initCore)
    this.accessControlManager = getAddress(params.accessControlManager)
  }

  async buildTx(): Promise<TransactionData> {
    const riskManagerArtifact = await readArtifact('RiskManager')

    const deployData: Hex = encodeDeployData({
      abi: riskManagerArtifact.abi,
      bytecode: riskManagerArtifact.bytecode as Hex,
      args: [this.initCore, this.accessControlManager],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
