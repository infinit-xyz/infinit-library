import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployActionMintRedeemStaticTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployActionMintRedeemStaticTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const actionMintRedeemStaticArtifact = await readArtifact('ActionMintRedeemStatic')

    const tx: TransactionData = {
      data: actionMintRedeemStaticArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
