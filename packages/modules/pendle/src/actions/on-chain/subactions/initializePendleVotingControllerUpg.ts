import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  InitializePendleVotingControllerUpgTxBuilder,
  InitializePendleVotingControllerUpgTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleVotingControllerUpg/initialize'

import { PendleV3Registry } from '@/src/type'

export type InitializePendleVotingControllerUpgSubActionParams = InitializePendleVotingControllerUpgTxBuilderParams

export class InitializePendleVotingControllerUpgSubaction extends SubAction<
  InitializePendleVotingControllerUpgSubActionParams,
  PendleV3Registry
> {
  constructor(client: InfinitWallet, params: InitializePendleVotingControllerUpgSubActionParams) {
    super(InitializePendleVotingControllerUpgSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new InitializePendleVotingControllerUpgTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleV3Registry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
