import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { DropReserveTxBuilder, DropReserveTxBuilderParams } from '@actions/subactions/tx-builders/poolConfigurator/dropReserve'

import { AaveV3Registry } from '@/src/type'

export type DropReserveSubActionParams = {
  assets: Address[]
  pool: Address
  poolConfigurator: Address
  aclManager: Address
}

export class DropReserveSubAction extends SubAction<DropReserveSubActionParams, object, object> {
  constructor(client: InfinitWallet, params: DropReserveSubActionParams) {
    super(DropReserveSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const asset of this.params.assets) {
      const subActionParams: DropReserveTxBuilderParams = {
        asset,
        pool: this.params.pool,
        poolConfigurator: this.params.poolConfigurator,
        aclManager: this.params.aclManager,
      }
      this.txBuilders.push(new DropReserveTxBuilder(this.client, subActionParams))
    }
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
