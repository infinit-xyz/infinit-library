import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployUniswapV3FactoryTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployUniswapV3FactoryTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const uniswapV3FactoryArtifact = await readArtifact('UniswapV3Factory')

    const tx: TransactionData = {
      data: uniswapV3FactoryArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
