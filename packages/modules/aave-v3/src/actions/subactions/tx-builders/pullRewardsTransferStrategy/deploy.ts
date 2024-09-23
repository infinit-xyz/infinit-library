import { Address, Hex, encodeDeployData, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

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
    this.incentivesController = params.incentivesController
    this.rewardsAdmin = params.rewardsAdmin
    this.rewardsVault = params.rewardsVault
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
    if (this.incentivesController === zeroAddress) throw new ValidateInputValueError('incentivesController zero address')
    if (this.rewardsAdmin === zeroAddress) throw new ValidateInputValueError('rewrdsAdmin zero address')
    if (this.rewardsVault === zeroAddress) throw new ValidateInputValueError('rewrdsVault zero address')
  }
}
