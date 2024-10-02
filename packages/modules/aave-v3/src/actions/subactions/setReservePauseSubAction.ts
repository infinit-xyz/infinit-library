import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetReservePauseTxBuilder, SetReservePauseTxBuilderParams } from '@actions/subactions/tx-builders/poolConfigurator/setReservePause'

import { AaveV3Registry } from '@/src/type'

export type ReservePauseInfo = {
  asset: Address
  paused: boolean
}

export type SetReservePauseSubActionParams = {
  reservePauseInfos: ReservePauseInfo[]
  poolConfigurator: Address
  aclManager: Address
}

export class SetReservePauseSubAction extends SubAction<SetReservePauseSubActionParams, object, object> {
  constructor(client: InfinitWallet, params: SetReservePauseSubActionParams) {
    super(SetReservePauseSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const reservePauseInfo of this.params.reservePauseInfos) {
      const txBuilderParams: SetReservePauseTxBuilderParams = {
        asset: reservePauseInfo.asset,
        poolConfigurator: this.params.poolConfigurator,
        aclManager: this.params.aclManager,
        paused: reservePauseInfo.paused,
      }
      this.txBuilders.push(new SetReservePauseTxBuilder(this.client, txBuilderParams))
    }
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
