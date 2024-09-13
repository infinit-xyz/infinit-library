import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployTickLensTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployTickLensTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const tickLensArtifact = await readArtifact('TickLens')

    const tx: TransactionData = {
      data: tickLensArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
