import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  SetReserveFreezeTxBuilder,
  SetReserveFreezeTxBuilderParams,
} from '@actions/subactions/tx-builders/poolConfigurator/setReserveFreeze'

import { AaveV3Registry } from '@/src/type'

export type ReserveFreezeInfo = {
  asset: Address
  freeze: boolean
}

export type SetReserveFreezeSubActionParams = {
  reserveFreezeInfos: ReserveFreezeInfo[]
  poolConfigurator: Address
  aclManager: Address
}

export class SetReserveFreezeSubAction extends SubAction<SetReserveFreezeSubActionParams, Object, Object> {
  constructor(client: InfinitWallet, params: SetReserveFreezeSubActionParams) {
    super(SetReserveFreezeSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const reserveFreezeInfo of this.params.reserveFreezeInfos) {
      const txBuilderParams: SetReserveFreezeTxBuilderParams = {
        asset: reserveFreezeInfo.asset,
        poolConfigurator: this.params.poolConfigurator,
        aclManager: this.params.aclManager,
        freeze: reserveFreezeInfo.freeze,
      }
      this.txBuilders.push(new SetReserveFreezeTxBuilder(this.client, txBuilderParams))
    }
  }

  protected async updateRegistryAndMessage(
    registry: AaveV3Registry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<AaveV3Registry, {}>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
