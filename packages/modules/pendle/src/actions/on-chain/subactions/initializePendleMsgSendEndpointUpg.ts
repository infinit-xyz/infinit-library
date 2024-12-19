import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  InitializePendleMsgSendEndpointUpgTxBuilder,
  InitializePendleMsgSendEndpointUpgTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleMsgSendEndpointUpg/initialize'

import { PendleV3Registry } from '@/src/type'

export type InitializePendleMsgSendEndpointUpgSubactionParams = InitializePendleMsgSendEndpointUpgTxBuilderParams
export class InitializePendleMsgSendEndpointUpgSubaction extends SubAction<
  InitializePendleMsgSendEndpointUpgSubactionParams,
  PendleV3Registry
> {
  constructor(client: InfinitWallet, params: InitializePendleMsgSendEndpointUpgSubactionParams) {
    super(InitializePendleMsgSendEndpointUpgSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new InitializePendleMsgSendEndpointUpgTxBuilder(this.client, this.params)]
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
