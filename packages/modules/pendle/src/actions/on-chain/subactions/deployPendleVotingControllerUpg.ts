import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployPendleVotingContollerUpgTxBuilderParams,
  DeployPendleVotingControllerUpgTxBuilder,
} from '@actions/subactions/tx-builders/PendleVotingControllerUpg/deploy'

import { PendleV3Registry } from '@/src/type'

export type DeployPendleVotingContollerUpgSubactionParams = DeployPendleVotingContollerUpgTxBuilderParams

export type DeployPendleVotingContollerUpgSubactionMsg = {
  pendleVotingContollerUpgImpl: Address
}

export class DeployPendleVotingContollerUpgSubaction extends SubAction<
  DeployPendleVotingContollerUpgSubactionParams,
  PendleV3Registry,
  DeployPendleVotingContollerUpgSubactionMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleVotingContollerUpgSubactionParams) {
    super(DeployPendleVotingContollerUpgSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployPendleVotingControllerUpgTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployPendleVotingContollerUpgSubactionMsg>> {
    const [deployPendleSwapTxHash] = txHashes
    const { contractAddress: pendleVotingContollerUpg } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleSwapTxHash,
    })
    if (!pendleVotingContollerUpg) {
      throw new ContractNotFoundError(deployPendleSwapTxHash, 'PendleSwap')
    }
    registry.pendleVotingContollerUpgImpl = pendleVotingContollerUpg

    const newMessage = {
      pendleVotingContollerUpgImpl: pendleVotingContollerUpg,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
