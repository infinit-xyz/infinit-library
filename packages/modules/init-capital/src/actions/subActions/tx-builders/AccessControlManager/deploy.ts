import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployAccessControlManagerTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployAccessControlManagerTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const accessControlManagerArtifact = await readArtifact('AccessControlManager')

    const tx: TransactionData = {
      data: accessControlManagerArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
