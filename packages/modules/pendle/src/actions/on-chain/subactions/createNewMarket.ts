import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  CreateNewMarketTxBuilder,
  CreateNewMarketTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleMarketFactoryV3/createNewMarket'

import { PendleV3Registry } from '@/src/type'

export type createNewMarketSubactionParams = CreateNewMarketTxBuilderParams

export class createNewMarketSubaction extends SubAction<createNewMarketSubactionParams, PendleV3Registry> {
  constructor(client: InfinitWallet, params: CreateNewMarketTxBuilderParams) {
    super(createNewMarketSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new CreateNewMarketTxBuilder(this.client, this.params)]
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
