import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetFacetForSelectorsTxBuilder } from '@/src/actions/on-chain/subactions/txBuilders/PendleRouterStatic/setFacetForSelectors'
import { PendleV3Registry } from '@/src/type'

export type SetSetPendleRouterStaticFacetsParams = {
  pendleRouterStatic: Address
  actionStorageStatic: Address
  actionInfoStatic: Address
  actionMarketAuxStatic: Address
  actionMarketCoreStatic: Address
  actionMintRedeemStatic: Address
  actionVePendleStatic: Address
}

export type SetSetPendleRouterStaticFacetsMsg = {}

export class SetSetPendleRouterStaticFacets1SubAction extends SubAction<
  SetSetPendleRouterStaticFacetsParams,
  PendleV3Registry,
  SetSetPendleRouterStaticFacetsMsg
> {
  constructor(client: InfinitWallet, params: SetSetPendleRouterStaticFacetsParams) {
    super(SetSetPendleRouterStaticFacets1SubAction.name, client, params)
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
    registry: PendleV3Registry,
    _txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, SetSetPendleRouterStaticFacetsMsg>> {
    return { newRegistry: registry, newMessage: {} }
  }
}
