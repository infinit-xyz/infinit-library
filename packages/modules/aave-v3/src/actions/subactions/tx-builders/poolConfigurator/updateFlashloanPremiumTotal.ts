import { Address, encodeFunctionData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type UpdateFlashloanPremiumTotalParams = {
  poolConfig: Address
  flashloanPremiumsTotal: bigint
}

export class UpdateFlashloanPremiumTotalTxBuilder extends TxBuilder {
  private poolConfigurator: Address
  private flashloanPremiumsTotal: bigint

  constructor(client: InfinitWallet, params: UpdateFlashloanPremiumTotalParams) {
    super(UpdateFlashloanPremiumTotalTxBuilder.name, client)
    this.flashloanPremiumsTotal = params.flashloanPremiumsTotal
    this.poolConfigurator = params.poolConfig
  }

  async buildTx(): Promise<TransactionData> {
    const poolConfiguratorArtifact = await readArtifact('PoolConfigurator')

    const callData = encodeFunctionData({
      abi: poolConfiguratorArtifact.abi,
      functionName: 'updateFlashloanPremiumTotal',
      args: [this.flashloanPremiumsTotal],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.poolConfigurator,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // NOTE: poolProxy can be zeroAddress
  }
}
