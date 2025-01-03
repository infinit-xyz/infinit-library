import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployPendleBoringOneracleTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet, _params: {}) {
    super(DeployPendleBoringOneracleTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const pendleBoringOneracleArtifact = await readArtifact('PendleBoringOneracle')

    const tx: TransactionData = {
      data: pendleBoringOneracleArtifact.bytecode,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // no need to validate
  }
}
