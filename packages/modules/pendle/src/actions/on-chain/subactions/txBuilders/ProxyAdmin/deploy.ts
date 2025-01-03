import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployProxyAdminTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployProxyAdminTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const proxyAdminArtifact = await readArtifact('ProxyAdmin')

    const tx: TransactionData = {
      data: proxyAdminArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
