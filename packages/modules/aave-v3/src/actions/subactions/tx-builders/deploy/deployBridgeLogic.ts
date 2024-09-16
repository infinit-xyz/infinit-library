import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployBridgeLogicParams = {}

export class DeployBridgeLogicTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployBridgeLogicTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const bridgeLogic = await readArtifact('BridgeLogic')

    const tx: TransactionData = {
      data: bridgeLogic.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
