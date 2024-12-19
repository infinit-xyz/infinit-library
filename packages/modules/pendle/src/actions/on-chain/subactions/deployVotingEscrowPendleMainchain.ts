import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployVotingEscrowPendleMainchainTxBuilder,
  DeployVotingEscrowPendleMainchainTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/VotingEscrowPendleMainchain/deploy'

import { PendleV3Registry } from '@/src/type'

export type DeployVotingEscrowPendleMainchainSubactionParams = DeployVotingEscrowPendleMainchainTxBuilderParams

export type DeployVotingEscrowPendleMainchainSubactionMsg = {
  votingEscrowPendleMainchain: Address
}
export class DeployVotingEscrowPendleMainchainSubaction extends SubAction<
  DeployVotingEscrowPendleMainchainSubactionParams,
  PendleV3Registry,
  DeployVotingEscrowPendleMainchainSubactionMsg
> {
  constructor(client: InfinitWallet, params: DeployVotingEscrowPendleMainchainTxBuilderParams) {
    super(DeployVotingEscrowPendleMainchainSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployVotingEscrowPendleMainchainTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployVotingEscrowPendleMainchainSubactionMsg>> {
    const [DeployVotingEscrowPendleMainchainTxHash] = txHashes
    const { contractAddress: votingEscrowPendleMainchain } = await this.client.publicClient.waitForTransactionReceipt({
      hash: DeployVotingEscrowPendleMainchainTxHash,
    })
    if (!votingEscrowPendleMainchain) {
      throw new ContractNotFoundError(DeployVotingEscrowPendleMainchainTxHash, 'VotingEscrowPendleMainchain')
    }
    registry.votingEscrowPendleMainchain = votingEscrowPendleMainchain

    const newMessage = {
      votingEscrowPendleMainchain: votingEscrowPendleMainchain,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
