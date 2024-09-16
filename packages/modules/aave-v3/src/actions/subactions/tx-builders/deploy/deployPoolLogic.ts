import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPoolLogicParams = {}

export class DeployPoolLogicTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployPoolLogicTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const poolLogic = await readArtifact('PoolLogic')

    const tx: TransactionData = {
      data: poolLogic.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
