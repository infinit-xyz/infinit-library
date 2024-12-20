import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployBaseSplitCodeFactoryContractTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployBaseSplitCodeFactoryContractTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const baseSplitCodeFactoryContractArtifact = await readArtifact('BaseSplitCodeFactoryContract')

    const tx: TransactionData = {
      data: baseSplitCodeFactoryContractArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
