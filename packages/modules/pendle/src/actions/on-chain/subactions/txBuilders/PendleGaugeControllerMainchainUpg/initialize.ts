import { Address, Hex, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializePendleGaugeControllerMainchainUpgTxBuilderParams = {
  pendleGaugeControllerMainchainUpg: Address
}

export class InitializePendleGaugeControllerMainchainUpgTxBuilder extends TxBuilder {
  public pendleGaugeControllerMainchainUpg: Address

  constructor(client: InfinitWallet, params: InitializePendleGaugeControllerMainchainUpgTxBuilderParams) {
    super(InitializePendleGaugeControllerMainchainUpgTxBuilder.name, client)
    this.pendleGaugeControllerMainchainUpg = getAddress(params.pendleGaugeControllerMainchainUpg)
  }

  async buildTx(): Promise<TransactionData> {
    const pendleGaugeControllerMainchainUpgArtifact = await readArtifact('PendleGaugeControllerMainchainUpg')

    const functionData: Hex = encodeFunctionData({
      abi: pendleGaugeControllerMainchainUpgArtifact.abi,
      functionName: 'initialize',
      args: [],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.pendleGaugeControllerMainchainUpg,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.pendleGaugeControllerMainchainUpg === zeroAddress)
      throw new ValidateInputZeroAddressError('PENDLE_GAUGE_CONTROLLER_MAINCHAIN_UPG')
  }
}
