import { Address, Hex, encodeDeployData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployConfigTxBuilderParams {
  accessControlManager: Address
}

export class DeployConfigTxBuilder extends TxBuilder {
  private accessControlManager: Address

  constructor(client: InfinitWallet, params: DeployConfigTxBuilderParams) {
    super(DeployConfigTxBuilder.name, client)
    this.accessControlManager = getAddress(params.accessControlManager)
  }

  async buildTx(): Promise<TransactionData> {
    const configArtifact = await readArtifact('Config')

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
