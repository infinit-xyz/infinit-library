import { Address, Hex, encodeDeployData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployPosManagerTxBuilderParams {
  accessControlManager: Address
}

export class DeployPosManagerTxBuilder extends TxBuilder {
  private accessControlManager: Address

  constructor(client: InfinitWallet, params: DeployPosManagerTxBuilderParams) {
    super(DeployPosManagerTxBuilder.name, client)
    this.accessControlManager = getAddress(params.accessControlManager)
  }

  async buildTx(): Promise<TransactionData> {
    const configArtifact = await readArtifact('PosManager')

    const deployData: Hex = encodeDeployData({
      abi: configArtifact.abi,
      bytecode: configArtifact.bytecode as Hex,
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
