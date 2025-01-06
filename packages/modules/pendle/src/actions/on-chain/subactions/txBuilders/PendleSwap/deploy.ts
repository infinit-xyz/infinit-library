import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployPendleSwapTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployPendleSwapTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const pendleSwapArtifact = await readArtifact('PendleSwap')

    const tx: TransactionData = {
      data: pendleSwapArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
