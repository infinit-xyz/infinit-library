import { Address, Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployReservesSetupHelperParams = {
  poolConfig: Address
  poolAddressProvider: Address
}

export class DeployReservesSetupHelperTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployReservesSetupHelperTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const reservesSetupHelperArtifact = await readArtifact('ReservesSetupHelper')

    const tx: TransactionData = {
      data: reservesSetupHelperArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
