import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializeRewardsControllerParams = {
  rewardsController: Address
  emtyAddress: Address
}

export class InitializeRewardsControllerTxBuilder extends TxBuilder {
  private rewardsController: Address
  private emtyAddress: Address

  constructor(client: InfinitWallet, params: InitializeRewardsControllerParams) {
    super(InitializeRewardsControllerTxBuilder.name, client)
    this.rewardsController = getAddress(params.rewardsController)
    this.emtyAddress = getAddress(params.emtyAddress)
  }

  async buildTx(): Promise<TransactionData> {
    const rewardsControllerArtifact = await readArtifact('RewardsController')
    const callData = encodeFunctionData({ abi: rewardsControllerArtifact.abi, functionName: 'initialize', args: [this.emtyAddress] })

    const tx: TransactionData = {
      data: callData,
      to: this.rewardsController,
    }
    return tx
  }

  public validate(): any {
    if (this.rewardsController === zeroAddress) throw new ValidateInputValueError('rewards controller zero address')
  }
}
