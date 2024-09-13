import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployNFTDescriptorTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployNFTDescriptorTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const nftDescriptorArtifact = await readArtifact('NFTDescriptor')

    const tx: TransactionData = {
      data: nftDescriptorArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
