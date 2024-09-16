import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { ApproveTxBuilder, ApproveTxBuilderParams } from '@actions/subactions/tx-builders/erc20/approve'
import { SupplyTxBuilder, SupplyTxBuilderParams } from '@actions/subactions/tx-builders/pool/supply'

import { AaveV3Registry } from '@/src/type'

export type SupplyParams = {
  token: Address
  amount: bigint
  onBehalfOf: Address
  referalCode: number
}

export type SupplyReserveSubActionParams = {
  pool: Address
  reserves: SupplyParams[]
}

export class SupplyReserveSubAction extends SubAction<SupplyReserveSubActionParams, AaveV3Registry, Object> {
  constructor(client: InfinitWallet, params: SupplyReserveSubActionParams) {
    super(SupplyReserveSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const reserve of this.params.reserves) {
      // build approve Tx
      const approveParams: ApproveTxBuilderParams = {
        token: reserve.token,
        spender: this.params.pool,
        amount: reserve.amount,
      }
      // build supply Tx
      const supplyParams: SupplyTxBuilderParams = {
        pool: this.params.pool,
        asset: reserve.token,
        amount: reserve.amount,
        onBehalfOf: reserve.onBehalfOf,
        referalCode: reserve.referalCode,
      }
      // build setup oracle Tx
      const approveTx = new ApproveTxBuilder(this.client, approveParams)
      const supplyTx = new SupplyTxBuilder(this.client, supplyParams)
      this.txBuilders.push(approveTx)
      this.txBuilders.push(supplyTx)
    }
  }

  protected async updateRegistryAndMessage(
    registry: AaveV3Registry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<AaveV3Registry, {}>> {
    // no new address, do nothing
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
