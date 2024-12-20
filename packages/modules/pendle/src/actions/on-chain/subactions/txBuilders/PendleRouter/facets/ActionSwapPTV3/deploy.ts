import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployActionSwapPTV3TxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployActionSwapPTV3TxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const ActionSwapPTV3Artifact = await readArtifact('ActionSwapPTV3')

    const tx: TransactionData = {
      data: ActionSwapPTV3Artifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
