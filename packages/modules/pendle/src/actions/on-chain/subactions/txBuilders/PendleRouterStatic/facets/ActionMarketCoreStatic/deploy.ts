import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployActionMarketCoreStaticTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployActionMarketCoreStaticTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const ActionMarketCoreStaticArtifact = await readArtifact('ActionMarketCoreStatic')

    const tx: TransactionData = {
      data: ActionMarketCoreStaticArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
