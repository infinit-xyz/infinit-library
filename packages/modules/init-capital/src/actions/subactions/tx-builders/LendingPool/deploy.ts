import { Address, encodeDeployData, getAddress, Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployLendingPoolTxBuilderParams {
  initCore: Address
  accessControlManager: Address
}

export class DeployLendingPoolTxBuilder extends TxBuilder {
  private initCore: Address
  private accessControlManager: Address
  
  constructor(client: InfinitWallet, params: DeployLendingPoolTxBuilderParams) {
    super(DeployLendingPoolTxBuilder.name, client)
    this.initCore = getAddress(params.initCore)
    this.accessControlManager = getAddress(params.accessControlManager)
  }

  async buildTx(): Promise<TransactionData> {
    const lendingPoolArtifact = await readArtifact('LendingPool')

    const deployData: Hex = encodeDeployData({
      abi: lendingPoolArtifact.abi,
      bytecode: lendingPoolArtifact.bytecode as Hex,
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
