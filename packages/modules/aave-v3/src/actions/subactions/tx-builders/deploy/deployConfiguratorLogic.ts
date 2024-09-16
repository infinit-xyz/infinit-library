import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployConfiguratorLogicParams = {}

export class DeployConfiguratorLogicTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployConfiguratorLogicTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const configuratorLogic = await readArtifact('ConfiguratorLogic')

    const tx: TransactionData = {
      data: configuratorLogic.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
