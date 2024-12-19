import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployActionSimpleTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployActionSimpleTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const ActionSimpleArtifact = await readArtifact('ActionSimple')

    const tx: TransactionData = {
      data: ActionSimpleArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
