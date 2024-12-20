import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployOracleLibTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployOracleLibTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const oracleLibArtifact = await readArtifact('OracleLib')

    const tx: TransactionData = {
      data: oracleLibArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
