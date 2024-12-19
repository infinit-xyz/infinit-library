import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployPendlePYLpOracleTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployPendlePYLpOracleTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const pendlePYLpOracleArtifact = await readArtifact('PendlePYLpOracle')

    const tx: TransactionData = {
      data: pendlePYLpOracleArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
