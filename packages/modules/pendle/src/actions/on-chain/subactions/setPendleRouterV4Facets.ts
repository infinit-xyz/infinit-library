import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetSelectorToFacetsTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleRouter/setSelectorToFacets'

import { PendleRegistry } from '@/src/type'

export type SetPendleRouterV4FacetsParams = {
  pendleRouterV4: Address
  actionStorageV4: Address
  actionAddRemoveLiqV3: Address
  actionCallbackV3: Address
  actionMiscV3: Address
  actionSimple: Address
  actionSwapPTV3: Address
  actionSwapYTV3: Address
}

export type SetPendleRouterV4FacetsMsg = {}

export class SetPendleRouterV4FacetsSubAction extends SubAction<
  SetPendleRouterV4FacetsParams,
  PendleRegistry,
  SetPendleRouterV4FacetsMsg
> {
  constructor(client: InfinitWallet, params: SetPendleRouterV4FacetsParams) {
    super(SetPendleRouterV4FacetsSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(
      new SetSelectorToFacetsTxBuilder(this.client, {
        pendleRouter: this.params.pendleRouterV4,
        actionStorageV4: this.params.actionStorageV4,
        actionAddRemoveLiqV3: this.params.actionAddRemoveLiqV3,
        actionCallbackV3: this.params.actionCallbackV3,
        actionMiscV3: this.params.actionMiscV3,
        actionSimple: this.params.actionSimple,
        actionSwapPTV3: this.params.actionSwapPTV3,
        actionSwapYTV3: this.params.actionSwapYTV3,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: PendleRegistry,
    _txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, SetPendleRouterV4FacetsMsg>> {
    return { newRegistry: registry, newMessage: {} }
  }
}
