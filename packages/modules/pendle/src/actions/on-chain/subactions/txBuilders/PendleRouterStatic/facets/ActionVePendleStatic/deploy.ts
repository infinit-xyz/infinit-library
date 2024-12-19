import { Address, Hex, encodeDeployData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployActionVePendleStaticTxBuilderParams = {
  vePendle: Address
}

export class DeployActionVePendleStaticTxBuilder extends TxBuilder {
  public vePendle: Address

  constructor(client: InfinitWallet, params: DeployActionVePendleStaticTxBuilderParams) {
    super(DeployActionVePendleStaticTxBuilder.name, client)
    this.vePendle = params.vePendle
  }

  async buildTx(): Promise<TransactionData> {
    const actionVePendleStaticArtifact = await readArtifact('ActionVePendleStatic')

    const deployData: Hex = encodeDeployData({
      abi: actionVePendleStaticArtifact.abi,
      bytecode: actionVePendleStaticArtifact.bytecode,
      args: [this.vePendle],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
