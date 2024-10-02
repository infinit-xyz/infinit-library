import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPullRewardsTransferStrategyParams = {
  incentivesController: Address
  rewardsAdmin: Address
  rewardsVault: Address
}

export class DeployPullRewardsTransferStrategyTxBuilder extends TxBuilder {
  incentivesController: Address
  rewardsAdmin: Address
  rewardsVault: Address

  constructor(client: InfinitWallet, params: DeployPullRewardsTransferStrategyParams) {
    super(DeployPullRewardsTransferStrategyTxBuilder.name, client)
    this.incentivesController = getAddress(params.incentivesController)
    this.rewardsAdmin = getAddress(params.rewardsAdmin)
    this.rewardsVault = getAddress(params.rewardsVault)
  }

  async buildTx(): Promise<TransactionData> {
    const pullRewardsTransferStrategyArtifact = await readArtifact('PullRewardsTransferStrategy')

    const deployData: Hex = encodeDeployData({
      abi: pullRewardsTransferStrategyArtifact.abi,
      bytecode: pullRewardsTransferStrategyArtifact.bytecode,
      args: [this.incentivesController, this.rewardsAdmin, this.rewardsVault],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.incentivesController === zeroAddress) throw new ValidateInputZeroAddressError('INCENTIVES_CONTROLLER')
    if (this.rewardsAdmin === zeroAddress) throw new ValidateInputZeroAddressError('REWARDS_ADMIN')
    if (this.rewardsVault === zeroAddress) throw new ValidateInputZeroAddressError('REWARDS_VAULT')
  }
}
