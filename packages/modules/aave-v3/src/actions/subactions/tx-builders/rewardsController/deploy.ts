import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployRewardsControllerParams = {
  emissionManager: Address
}

export class DeployRewardsControllerTxBuilder extends TxBuilder {
  emissionManager: Address

  constructor(client: InfinitWallet, params: DeployRewardsControllerParams) {
    super(DeployRewardsControllerTxBuilder.name, client)
    this.emissionManager = getAddress(params.emissionManager)
  }

  async buildTx(): Promise<TransactionData> {
    const emissionManagerArtifact = await readArtifact('RewardsController')

    const deployData: Hex = encodeDeployData({
      abi: emissionManagerArtifact.abi,
      bytecode: emissionManagerArtifact.bytecode,
      args: [this.emissionManager],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.emissionManager === zeroAddress) throw new ValidateInputZeroAddressError('EMISSION_MANAGER')
  }
}
