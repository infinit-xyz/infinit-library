import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployActionStorageV4TxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployActionStorageV4TxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const actionStorageV4Artifact = await readArtifact('ActionStorageV4')

    const tx: TransactionData = {
      data: actionStorageV4Artifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
