import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeploySupplyLogicParams = {
  // owner: Address
}

export class DeploySupplyLogicTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeploySupplyLogicTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const supplyLogic = await readArtifact('SupplyLogic')

    const tx: TransactionData = {
      data: supplyLogic.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
