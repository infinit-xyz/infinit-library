import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  InitializePendleYieldContractFactoryTxBuilder,
  InitializePendleYieldContractFactoryTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleYieldContractFactory/initialize'

import { PendleRegistry } from '@/src/type'

export type InitializePendleYieldContractFactorySubactionParams = InitializePendleYieldContractFactoryTxBuilderParams

export class InitializePendleYieldContractFactorySubaction extends SubAction<
  InitializePendleYieldContractFactorySubactionParams,
  PendleRegistry
> {
  constructor(client: InfinitWallet, params: InitializePendleYieldContractFactorySubactionParams) {
    super(InitializePendleYieldContractFactorySubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new InitializePendleYieldContractFactoryTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleRegistry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleRegistry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
