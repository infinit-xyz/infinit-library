import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployActionMarketAuxStaticTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployActionMarketAuxStaticTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const ActionMarketAuxStaticArtifact = await readArtifact('ActionMarketAuxStatic')

    const tx: TransactionData = {
      data: ActionMarketAuxStaticArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
