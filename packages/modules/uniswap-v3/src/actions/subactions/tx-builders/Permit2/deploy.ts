import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployPermit2TxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployPermit2TxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const permit2Artifact = await readArtifact('Permit2')

    const tx: TransactionData = {
      data: permit2Artifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
