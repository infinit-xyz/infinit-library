import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployPendleVotingContollerUpgTxBuilderParams,
  DeployPendleVotingControllerUpgTxBuilder,
} from '@actions/on-chain/subactions/txBuilders/PendleVotingControllerUpg/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployPendleVotingContollerUpgSubactionParams = DeployPendleVotingContollerUpgTxBuilderParams

export type DeployPendleVotingContollerUpgSubactionMsg = {
  pendleVotingContollerUpgImpl: Address
}

export class DeployPendleVotingContollerUpgSubaction extends SubAction<
  DeployPendleVotingContollerUpgSubactionParams,
  PendleRegistry,
  DeployPendleVotingContollerUpgSubactionMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleVotingContollerUpgSubactionParams) {
    super(DeployPendleVotingContollerUpgSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployPendleVotingControllerUpgTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendleVotingContollerUpgSubactionMsg>> {
    const [deployPendleSwapTxHash] = txHashes
    const { contractAddress: pendleVotingContollerUpg } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleSwapTxHash,
    })
    if (!pendleVotingContollerUpg) {
      throw new ContractNotFoundError(deployPendleSwapTxHash, 'PendleSwap')
    }
    registry['pendleVotingContollerUpgImpl'] = pendleVotingContollerUpg

    const newMessage = {
      pendleVotingContollerUpgImpl: pendleVotingContollerUpg,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
