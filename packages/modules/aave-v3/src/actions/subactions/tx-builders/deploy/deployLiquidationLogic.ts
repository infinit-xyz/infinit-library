import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployLiquidationLogicParams = {}

export class DeployLiquidationLogicTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployLiquidationLogicTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const liquidationLogic = await readArtifact('LiquidationLogic')

    const tx: TransactionData = {
      data: liquidationLogic.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
