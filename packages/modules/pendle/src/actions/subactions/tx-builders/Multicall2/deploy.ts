import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployMulticall2TxBuilder extends TxBuilder {
  constructor(client: InfinitWallet, _params: {}) {
    super(DeployMulticall2TxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const pendleMulticall2Artifact = await readArtifact('Multicall2')

    const tx: TransactionData = {
      data: pendleMulticall2Artifact.bytecode,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // no constructor arguments, no need to validate
  }
}
