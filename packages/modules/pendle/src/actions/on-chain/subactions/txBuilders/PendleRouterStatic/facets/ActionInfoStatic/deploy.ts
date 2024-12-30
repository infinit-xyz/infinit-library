import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployActionInfoStaticTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployActionInfoStaticTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const ActionInfoStaticArtifact = await readArtifact('ActionInfoStatic')

    const tx: TransactionData = {
      data: ActionInfoStaticArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
