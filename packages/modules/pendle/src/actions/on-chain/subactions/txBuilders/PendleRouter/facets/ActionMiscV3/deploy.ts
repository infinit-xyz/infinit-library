import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployActionMiscV3TxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployActionMiscV3TxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const ActionMiscV3Artifact = await readArtifact('ActionMiscV3')

    const tx: TransactionData = {
      data: ActionMiscV3Artifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
