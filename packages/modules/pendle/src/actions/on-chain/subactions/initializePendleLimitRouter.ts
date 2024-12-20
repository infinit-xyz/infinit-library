import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  InitializePendleLimitRouterTxBuilder,
  InitializePendleLimitRouterTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleLimitRouter/initialize'

import { PendleV3Registry } from '@/src/type'

export type InitializePendleLimitRouterSubActionParams = InitializePendleLimitRouterTxBuilderParams

export class InitializePendleLimitRouterSubaction extends SubAction<InitializePendleLimitRouterSubActionParams, PendleV3Registry> {
  constructor(client: InfinitWallet, params: InitializePendleLimitRouterSubActionParams) {
    super(InitializePendleLimitRouterSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new InitializePendleLimitRouterTxBuilder(this.client, this.params)]
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
