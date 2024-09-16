import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployUiIncentiveDataProviderV3Params = {}

export class DeployUiIncentiveDataProviderV3TxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployUiIncentiveDataProviderV3TxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const uiIncentiveDataProviderV3 = await readArtifact('UiIncentiveDataProviderV3')

    const tx: TransactionData = {
      data: uiIncentiveDataProviderV3.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
