import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  InitializePendleMsgSendEndpointUpgTxBuilder,
  InitializePendleMsgSendEndpointUpgTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleMsgSendEndpointUpg/initialize'

import { PendleRegistry } from '@/src/type'

export type InitializePendleMsgSendEndpointUpgSubactionParams = InitializePendleMsgSendEndpointUpgTxBuilderParams
export class InitializePendleMsgSendEndpointUpgSubaction extends SubAction<
  InitializePendleMsgSendEndpointUpgSubactionParams,
  PendleRegistry
> {
  constructor(client: InfinitWallet, params: InitializePendleMsgSendEndpointUpgSubactionParams) {
    super(InitializePendleMsgSendEndpointUpgSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new InitializePendleMsgSendEndpointUpgTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(registry: PendleRegistry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<PendleRegistry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
