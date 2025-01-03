import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployActionStorageStaticTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployActionStorageStaticTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const actionStorageStaticArtifact = await readArtifact('ActionStorageStatic')

    const tx: TransactionData = {
      data: actionStorageStaticArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
