import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  SetReserveBorrowingTxBuilder,
  SetReserveBorrowingTxBuilderParams,
} from '@actions/subactions/tx-builders/poolConfigurator/setReserveBorrowing'

import { AaveV3Registry } from '@/src/type'

export type ReserveBorrowingInfo = {
  asset: Address
  enabled: boolean
}

export type SetReserveBorrowingSubActionParams = {
  reserveBorrowingInfos: ReserveBorrowingInfo[]
  poolConfigurator: Address
  aclManager: Address
}

export class SetReserveBorrowingSubAction extends SubAction<SetReserveBorrowingSubActionParams, object, object> {
  constructor(client: InfinitWallet, params: SetReserveBorrowingSubActionParams) {
    super(SetReserveBorrowingSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const reserveBorrowingInfo of this.params.reserveBorrowingInfos) {
      const txBuilderParams: SetReserveBorrowingTxBuilderParams = {
        asset: reserveBorrowingInfo.asset,
        poolConfigurator: this.params.poolConfigurator,
        aclManager: this.params.aclManager,
        enabled: reserveBorrowingInfo.enabled,
      }
      this.txBuilders.push(new SetReserveBorrowingTxBuilder(this.client, txBuilderParams))
    }
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
