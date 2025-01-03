import { Address, Hex, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

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
    this.pendleGaugeControllerMainchainUpg = getAddress(params.pendleGaugeControllerMainchainUpg)
    this.newImplementation = getAddress(params.newImplementation)
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

  public async validate(): Promise<void> {
    const pendleGaugeControllerMainchainUpgArtifact = await readArtifact('PendleGaugeControllerMainchainUpg')

    const owner = await this.client.publicClient.readContract({
      address: this.pendleGaugeControllerMainchainUpg,
      abi: pendleGaugeControllerMainchainUpgArtifact.abi,
      functionName: 'owner',
      args: [],
    })

    if (owner !== this.client.walletClient.account.address) {
      throw new ContractValidateError('CALLER_NOT_OWNER')
    }
  }
}
