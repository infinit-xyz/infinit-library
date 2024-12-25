import { Address, Hex, encodeFunctionData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type UpgradePendleGaugeControllerMainchainUpgTxBuilderParams = {
  pendleGaugeControllerMainchainUpg: Address
  newImplementation: Address
}

export class UpgradePendleGaugeControllerMainchainUpgTxBuilder extends TxBuilder {
  public pendleGaugeControllerMainchainUpg: Address
  public newImplementation: Address

  constructor(client: InfinitWallet, params: UpgradePendleGaugeControllerMainchainUpgTxBuilderParams) {
    super(UpgradePendleGaugeControllerMainchainUpgTxBuilder.name, client)
    this.pendleGaugeControllerMainchainUpg = params.pendleGaugeControllerMainchainUpg
    this.newImplementation = params.newImplementation
  }

  async buildTx(): Promise<TransactionData> {
    const pendleGaugeControllerMainchainUpgArtifact = await readArtifact('PendleGaugeControllerMainchainUpg')

    const functionData: Hex = encodeFunctionData({
      abi: pendleGaugeControllerMainchainUpgArtifact.abi,
      functionName: 'upgradeTo',
      args: [this.newImplementation],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.pendleGaugeControllerMainchainUpg,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
