import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployPendleGovernanceProxyTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployPendleGovernanceProxyTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const pendleGovernanceProxyArtifact = await readArtifact('PendleGovernanceProxy')

    const tx: TransactionData = {
      data: pendleGovernanceProxyArtifact.bytecode,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // no constructor arguments, no need to validate
  }
}
