import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployActionVePendleStaticTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployActionVePendleStaticTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const ActionVePendleStaticArtifact = await readArtifact('ActionVePendleStatic')

    const tx: TransactionData = {
      data: ActionVePendleStaticArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
