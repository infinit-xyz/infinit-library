import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployCalldataLogicParams = {}

export class DeployCalldataLogicTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployCalldataLogicTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const calldataLogic = await readArtifact('CalldataLogic')

    const tx: TransactionData = {
      data: calldataLogic.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
