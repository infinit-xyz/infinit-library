import { Address, Hex, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type RewardsConfigInput = {
  emissionPerSecond: bigint
  totalSupply: bigint
  distributionEnd: number
  asset: Address
  reward: Address
  transferStrategy: Address
  rewardOracle: Address
}

export type ConfigureAssetsParams = {
  emissionManager: Address
  rewardsConfigInputs: RewardsConfigInput[]
}

export class ConfigureAssetsTxBuilder extends TxBuilder {
  emissionManager: Address
  rewardsConfigInputs: RewardsConfigInput[]
  constructor(client: InfinitWallet, params: ConfigureAssetsParams) {
    super(ConfigureAssetsTxBuilder.name, client)

    this.emissionManager = getAddress(params.emissionManager)
    this.rewardsConfigInputs = params.rewardsConfigInputs.map((input) => ({
      ...input,
      asset: getAddress(input.asset),
      reward: getAddress(input.reward),
      transferStrategy: getAddress(input.transferStrategy),
      rewardOracle: getAddress(input.rewardOracle),
    }))
  }

  async buildTx(): Promise<TransactionData> {
    const emissionManagerArtifact = await readArtifact('EmissionManager')

    const callData: Hex = encodeFunctionData({
      abi: emissionManagerArtifact.abi,
      functionName: 'configureAssets',
      args: [this.rewardsConfigInputs],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.emissionManager,
    }
    return tx
  }

  public async validate(): Promise<void> {
    this.rewardsConfigInputs.map((input) => {
      if (input.asset === zeroAddress) throw new ValidateInputValueError('ASSET_SHOULD_NOT_BE_ZERO_ADDRESS')
    })
    if (this.emissionManager === zeroAddress) throw new ValidateInputValueError('EMISSION_MANAGER_SHOULD_NOT_BE_ZERO_ADDRESS')
  }
}
