import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  InitializePendleVotingControllerUpgTxBuilder,
  InitializePendleVotingControllerUpgTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleVotingControllerUpg/initialize'

import { PendleRegistry } from '@/src/type'

export type InitializePendleVotingControllerUpgSubActionParams = InitializePendleVotingControllerUpgTxBuilderParams

export class InitializePendleVotingControllerUpgSubaction extends SubAction<
  InitializePendleVotingControllerUpgSubActionParams,
  PendleRegistry
> {
  constructor(client: InfinitWallet, params: InitializePendleVotingControllerUpgSubActionParams) {
    super(InitializePendleVotingControllerUpgSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new InitializePendleVotingControllerUpgTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(registry: PendleRegistry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<PendleRegistry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
