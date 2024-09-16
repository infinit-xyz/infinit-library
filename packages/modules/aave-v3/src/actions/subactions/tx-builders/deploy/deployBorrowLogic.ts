import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployBorrowLogicParams = {}

export class DeployBorrowLogicTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployBorrowLogicTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const borrowLogic = await readArtifact('BorrowLogic')

    const tx: TransactionData = {
      data: borrowLogic.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
