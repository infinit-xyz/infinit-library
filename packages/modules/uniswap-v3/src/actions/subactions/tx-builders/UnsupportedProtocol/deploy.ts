import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployUnsupportedProtocolTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployUnsupportedProtocolTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const unsupportedProtocolArtifact = await readArtifact('UnsupportedProtocol')

    const tx: TransactionData = {
      data: unsupportedProtocolArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
