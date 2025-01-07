import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployVotingEscrowPendleMainchainTxBuilder,
  DeployVotingEscrowPendleMainchainTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/VotingEscrowPendleMainchain/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployVotingEscrowPendleMainchainSubactionParams = DeployVotingEscrowPendleMainchainTxBuilderParams

export type DeployVotingEscrowPendleMainchainSubactionMsg = {
  votingEscrowPendleMainchain: Address
}
export class DeployVotingEscrowPendleMainchainSubaction extends SubAction<
  DeployVotingEscrowPendleMainchainSubactionParams,
  PendleRegistry,
  DeployVotingEscrowPendleMainchainSubactionMsg
> {
  constructor(client: InfinitWallet, params: DeployVotingEscrowPendleMainchainTxBuilderParams) {
    super(DeployVotingEscrowPendleMainchainSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployVotingEscrowPendleMainchainTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployVotingEscrowPendleMainchainSubactionMsg>> {
    const [deployVotingEscrowPendleMainchainTxHash] = txHashes
    const { contractAddress: votingEscrowPendleMainchain } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployVotingEscrowPendleMainchainTxHash,
    })
    if (!votingEscrowPendleMainchain) {
      throw new ContractNotFoundError(deployVotingEscrowPendleMainchainTxHash, 'VotingEscrowPendleMainchain')
    }
    registry['votingEscrowPendleMainchain'] = votingEscrowPendleMainchain

    const newMessage = {
      votingEscrowPendleMainchain: votingEscrowPendleMainchain,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
