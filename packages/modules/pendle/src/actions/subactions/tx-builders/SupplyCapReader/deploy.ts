import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class deploySupplyCapReaderTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet, _params: {}) {
    super(deploySupplyCapReaderTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const supplyCapReaderArtifact = await readArtifact('SupplyCapReader')

    const tx: TransactionData = {
      data: supplyCapReaderArtifact.bytecode,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // no constructor arguments, no need to validate
  }
}
