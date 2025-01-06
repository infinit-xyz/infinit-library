import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployPendleVotingControllerUpgTxBuilder,
  DeployPendleVotingControllerUpgTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleVotingControllerUpg/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployPendleVotingControllerUpgSubactionParams = DeployPendleVotingControllerUpgTxBuilderParams

export type DeployPendleVotingControllerUpgSubactionMsg = {
  pendleVotingControllerUpgImpl: Address
}

export class DeployPendleVotingControllerUpgSubaction extends SubAction<
  DeployPendleVotingControllerUpgSubactionParams,
  PendleRegistry,
  DeployPendleVotingControllerUpgSubactionMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleVotingControllerUpgSubactionParams) {
    super(DeployPendleVotingControllerUpgSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployPendleVotingControllerUpgTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendleVotingControllerUpgSubactionMsg>> {
    const [deployPendleVotingControllerUpgTxHash] = txHashes
    const { contractAddress: pendleVotingControllerUpg } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleVotingControllerUpgTxHash,
    })
    if (!pendleVotingControllerUpg) {
      throw new ContractNotFoundError(deployPendleVotingControllerUpgTxHash, 'PendleVotingControllerUpg')
    }
    registry['pendleVotingControllerUpgImpl'] = pendleVotingControllerUpg

    const newMessage = {
      pendleVotingControllerUpgImpl: pendleVotingControllerUpg,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
