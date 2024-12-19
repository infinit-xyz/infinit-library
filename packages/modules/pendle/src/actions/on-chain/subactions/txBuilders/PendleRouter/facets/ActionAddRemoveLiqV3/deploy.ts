import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployActionAddRemoveLiqV3TxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployActionAddRemoveLiqV3TxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const ActionAddRemoveLiqV3Artifact = await readArtifact('ActionAddRemoveLiqV3')

    const tx: TransactionData = {
      data: ActionAddRemoveLiqV3Artifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
