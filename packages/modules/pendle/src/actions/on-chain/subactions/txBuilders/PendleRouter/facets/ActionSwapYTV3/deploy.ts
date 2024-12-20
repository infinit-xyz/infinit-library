import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployActionSwapYTV3TxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployActionSwapYTV3TxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const ActionSwapYTV3Artifact = await readArtifact('ActionSwapYTV3')

    const tx: TransactionData = {
      data: ActionSwapYTV3Artifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
