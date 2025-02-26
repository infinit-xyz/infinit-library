import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetFacetForSelectorsTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleRouterStatic/setFacetForSelectors'

import { PendleRegistry } from '@/src/type'

export type SetPendleRouterStaticFacetsParams = {
  pendleRouterStatic: Address
  actionStorageStatic: Address
  actionInfoStatic: Address
  actionMarketAuxStatic: Address
  actionMarketCoreStatic: Address
  actionMintRedeemStatic: Address
  actionVePendleStatic: Address
}

export type SetPendleRouterStaticFacetsMsg = {}

export class SetPendleRouterStaticFacetsSubAction extends SubAction<
  SetPendleRouterStaticFacetsParams,
  PendleRegistry,
  SetPendleRouterStaticFacetsMsg
> {
  constructor(client: InfinitWallet, params: SetPendleRouterStaticFacetsParams) {
    super(SetPendleRouterStaticFacetsSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(
      new SetFacetForSelectorsTxBuilder(this.client, {
        pendleRouterStatic: this.params.pendleRouterStatic,
        actionStorageStatic: this.params.pendleRouterStatic,
        actionInfoStatic: this.params.pendleRouterStatic,
        actionMarketAuxStatic: this.params.pendleRouterStatic,
        actionMarketCoreStatic: this.params.pendleRouterStatic,
        actionMintRedeemStatic: this.params.pendleRouterStatic,
        actionVePendleStatic: this.params.pendleRouterStatic,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: PendleRegistry,
    _txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, SetPendleRouterStaticFacetsMsg>> {
    return { newRegistry: registry, newMessage: {} }
  }
}
