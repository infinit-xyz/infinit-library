import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployEModeLogicParams = {}

export class DeployEModeLogicTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployEModeLogicTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const emodeLogic = await readArtifact('EModeLogic')

    const tx: TransactionData = {
      data: emodeLogic.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
