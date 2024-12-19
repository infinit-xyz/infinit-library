import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  InitializePendleYieldContractFactoryTxBuilder,
  InitializePendleYieldContractFactoryTxBuilderParams,
} from '@actions/subactions/tx-builders/PendleYieldContractFactory/initialize'

import { PendleV3Registry } from '@/src/type'

export type InitializePendleYieldContractFactorySubactionParams = InitializePendleYieldContractFactoryTxBuilderParams

export class InitializePendleYieldContractFactorySubaction extends SubAction<
  InitializePendleYieldContractFactorySubactionParams,
  PendleV3Registry
> {
  constructor(client: InfinitWallet, params: InitializePendleYieldContractFactorySubactionParams) {
    super(InitializePendleYieldContractFactorySubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new InitializePendleYieldContractFactoryTxBuilder(this.client, this.params)]
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
