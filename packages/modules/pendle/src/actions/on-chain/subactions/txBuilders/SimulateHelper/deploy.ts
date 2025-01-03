import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeploySimulateHelperTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeploySimulateHelperTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const simulateHelperArtifact = await readArtifact('SimulateHelper')

    const tx: TransactionData = {
      data: simulateHelperArtifact.bytecode,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // no constructor arguments, no need to validate
  }
}
