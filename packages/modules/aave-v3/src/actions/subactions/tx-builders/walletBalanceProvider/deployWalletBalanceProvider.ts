import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployWalletBalanceProviderParams = {}

export class DeployWalletBalanceProviderTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployWalletBalanceProviderTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const walletBalanceProvider = await readArtifact('WalletBalanceProvider')

    const tx: TransactionData = {
      data: walletBalanceProvider.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
