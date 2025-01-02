import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  InitializePendleGaugeControllerMainchainUpgTxBuilder,
  InitializePendleGaugeControllerMainchainUpgTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleGaugeControllerMainchainUpg/initialize'

import { PendleRegistry } from '@/src/type'

export type InitializePendleGaugeControllerMainchainUpgSubActionParams = InitializePendleGaugeControllerMainchainUpgTxBuilderParams

export class InitializePendleGaugeControllerMainchainUpgSubaction extends SubAction<
  InitializePendleGaugeControllerMainchainUpgSubActionParams,
  PendleRegistry
> {
  constructor(client: InfinitWallet, params: InitializePendleGaugeControllerMainchainUpgSubActionParams) {
    super(InitializePendleGaugeControllerMainchainUpgSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new InitializePendleGaugeControllerMainchainUpgTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(registry: PendleRegistry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<PendleRegistry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
