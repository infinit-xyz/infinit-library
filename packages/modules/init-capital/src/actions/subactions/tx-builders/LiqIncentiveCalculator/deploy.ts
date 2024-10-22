import { Address, encodeDeployData, getAddress, Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployLiqIncentiveCalculatorTxBuilderParams {
  accessControlManager: Address
}

export class DeployLiqIncentiveCalculatorTxBuilder extends TxBuilder {
  private accessControlManager: Address
  
  constructor(client: InfinitWallet, params: DeployLiqIncentiveCalculatorTxBuilderParams) {
    super(DeployLiqIncentiveCalculatorTxBuilder.name, client)
    this.accessControlManager = getAddress(params.accessControlManager)
  }

  async buildTx(): Promise<TransactionData> {
    const liqIncentiveCalculatorArtifact = await readArtifact('LiqIncentiveCalculator')

    const deployData: Hex = encodeDeployData({
      abi: liqIncentiveCalculatorArtifact.abi,
      bytecode: liqIncentiveCalculatorArtifact.bytecode as Hex,
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
