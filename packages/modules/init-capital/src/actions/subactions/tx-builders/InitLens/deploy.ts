import { Address, Hex, encodeDeployData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployInitLensTxBuilderParams {
  initCore: Address
  posManager: Address
  riskManager: Address
  config: Address
}

export class DeployInitLensTxBuilder extends TxBuilder {
  private initCore: Address
  private posManager: Address
  private riskManager: Address
  private config: Address

  constructor(client: InfinitWallet, params: DeployInitLensTxBuilderParams) {
    super(DeployInitLensTxBuilder.name, client)
    this.initCore = getAddress(params.initCore)
    this.posManager = getAddress(params.posManager)
    this.riskManager = getAddress(params.riskManager)
    this.config = getAddress(params.config)
  }

  async buildTx(): Promise<TransactionData> {
    const InitLensArtifact = await readArtifact('InitLens')

    const deployData: Hex = encodeDeployData({
      abi: InitLensArtifact.abi,
      bytecode: InitLensArtifact.bytecode as Hex,
      args: [this.initCore, this.posManager, this.riskManager, this.config],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
