import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

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
    this.poolConfigurator = getAddress(params.poolConfig)
    this.flashloanPremiumsTotal = params.flashloanPremiumsTotal
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
    if (this.poolConfigurator === zeroAddress) throw new ValidateInputValueError('pool configurator cannot be zero address')
  }
}
