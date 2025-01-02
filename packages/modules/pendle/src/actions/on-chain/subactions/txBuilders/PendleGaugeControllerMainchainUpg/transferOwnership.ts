import { Address, Hex, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type TransferOwnershipPendleGaugeControllerMainchainUpgTxBuilderParams = {
  pendleGaugeControllerMainchainUpg: Address
  newOwner: Address
}

export class TransferOwnershipPendleGaugeControllerMainchainUpgTxBuilder extends TxBuilder {
  public newOwner: Address
  public pendleGaugeControllerMainchainUpg: Address

  constructor(client: InfinitWallet, params: TransferOwnershipPendleGaugeControllerMainchainUpgTxBuilderParams) {
    super(TransferOwnershipPendleGaugeControllerMainchainUpgTxBuilder.name, client)
    this.pendleGaugeControllerMainchainUpg = getAddress(params.pendleGaugeControllerMainchainUpg)
    this.newOwner = getAddress(params.newOwner)
  }

  async buildTx(): Promise<TransactionData> {
    const pendleGaugeControllerMainchainUpgArtifact = await readArtifact('PendleGaugeControllerMainchainUpg')

    const functionData: Hex = encodeFunctionData({
      abi: pendleGaugeControllerMainchainUpgArtifact.abi,
      functionName: 'transferOwnership',
      args: [this.newOwner, true, false],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.pendleGaugeControllerMainchainUpg,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
