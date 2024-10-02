import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetRewardsControllerParams = {
  emissionManager: Address
  rewardsController: Address
}

export class SetRewardsControllerTxBuilder extends TxBuilder {
  emissionManager: Address
  rewardsController: Address

  constructor(client: InfinitWallet, params: SetRewardsControllerParams) {
    super(SetRewardsControllerTxBuilder.name, client)
    this.emissionManager = getAddress(params.emissionManager)
    this.rewardsController = getAddress(params.rewardsController)
  }

  async buildTx(): Promise<TransactionData> {
    const emissionManagerArtifact = await readArtifact('EmissionManager')

    const callData = encodeFunctionData({
      abi: emissionManagerArtifact.abi,
      functionName: 'setRewardsController',
      args: [this.rewardsController],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.emissionManager,
    }
    return tx
  }

  public async validate(): Promise<void> {
    const emissionManagerArtifact = await readArtifact('EmissionManager')
    const owner = await this.client.publicClient.readContract({
      address: this.emissionManager,
      abi: emissionManagerArtifact.abi,
      functionName: 'owner',
      args: [],
    })

    if (owner !== this.client.walletClient.account.address) throw new ContractValidateError('CALLER_NOT_OWNER')

    if (this.rewardsController === zeroAddress) throw new ValidateInputZeroAddressError('REWARDS_CONTROLLER')
  }
}
