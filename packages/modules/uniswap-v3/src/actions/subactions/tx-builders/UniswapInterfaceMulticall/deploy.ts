import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export class DeployUniswapInterfaceMulticallTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployUniswapInterfaceMulticallTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const uniswapInterfaceMulticallArtifact = await readArtifact('UniswapInterfaceMulticall')

    const tx: TransactionData = {
      data: uniswapInterfaceMulticallArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
