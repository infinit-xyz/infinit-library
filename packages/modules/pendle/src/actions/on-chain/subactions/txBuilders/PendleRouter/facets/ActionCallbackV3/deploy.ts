import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployActionCallbackV3TxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployActionCallbackV3TxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const ActionCallbackV3Artifact = await readArtifact('ActionCallbackV3')

    const tx: TransactionData = {
      data: ActionCallbackV3Artifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
