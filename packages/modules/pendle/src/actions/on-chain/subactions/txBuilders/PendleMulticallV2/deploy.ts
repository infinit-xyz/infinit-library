import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployPendleMulticallV2TxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployPendleMulticallV2TxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const pendleMulticallV2Artifact = await readArtifact('PendleMulticallV2')

    const tx: TransactionData = {
      data: pendleMulticallV2Artifact.bytecode,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // no constructor arguments, no need to validate
  }
}
