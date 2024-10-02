import { Address, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type UpdateFlashloanPremiumToProtocolParams = {
  poolConfig: Address
  flashloanPremiumsProtocol: bigint
}

export class UpdateFlashloanPremiumToProtocolTxBuilder extends TxBuilder {
  private poolConfigurator: Address
  private flashloanPremiumsProtocol: bigint

  constructor(client: InfinitWallet, params: UpdateFlashloanPremiumToProtocolParams) {
    super(UpdateFlashloanPremiumToProtocolTxBuilder.name, client)
    this.poolConfigurator = getAddress(params.poolConfig)
    this.flashloanPremiumsProtocol = params.flashloanPremiumsProtocol
  }

  async buildTx(): Promise<TransactionData> {
    const poolConfiguratorArtifact = await readArtifact('PoolConfigurator')

    const callData = encodeFunctionData({
      abi: poolConfiguratorArtifact.abi,
      functionName: 'updateFlashloanPremiumToProtocol',
      args: [this.flashloanPremiumsProtocol],
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
