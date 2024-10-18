import { Address, encodeFunctionData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type ModeStatus = {
  canCollateralize: boolean
  canDecollateralize: boolean
  canBorrow: boolean
  canRepay: boolean
}

export type SetModeStatusTxBuilderParams = {
  config: Address
  mode: number
  status: ModeStatus
}

export class SetModeStatusTxBuilder extends TxBuilder {
  config: Address
  mode: number
  status: ModeStatus

  constructor(client: InfinitWallet, params: SetModeStatusTxBuilderParams) {
    super(SetModeStatusTxBuilder.name, client)
    this.config = params.config
    this.mode = params.mode
    this.status = params.status
  }

  async buildTx(): Promise<TransactionData> {
    const configArtifact = await readArtifact('Config')

    const callData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setModeStatus',
      args: [this.mode, this.status],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.config,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
