import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetBorrFactorE18TxBuilder } from '@actions/subactions/tx-builders/Config/setBorrFactors_e18'
import { SetCollFactorE18TxBuilder } from '@actions/subactions/tx-builders/Config/setCollFactors_e18'

import { InitCapitalRegistry } from '@/src/type'

type PoolFactor = {
  pool: Address
  borrFactor: bigint
  collFactor: bigint
}

export type SetModeFactorsSubActionParams = {
  config: Address
  mode: number
  poolFactors: PoolFactor[]
}

export type TransferProxyAdminOwnerMsg = {}

export class SetModeFactorsSubAction extends SubAction<SetModeFactorsSubActionParams, InitCapitalRegistry, TransferProxyAdminOwnerMsg> {
  constructor(client: InfinitWallet, params: SetModeFactorsSubActionParams) {
    super(SetModeFactorsSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- set mode factors -----------
    const pools: Address[] = []
    const collFactors: bigint[] = []
    const borrFactors: bigint[] = []
    this.params.poolFactors.forEach((poolFactor) => {
      pools.push(poolFactor.pool)
      collFactors.push(poolFactor.collFactor)
      borrFactors.push(poolFactor.borrFactor)
    })

    // Set mode's pools collateral factors
    this.txBuilders.push(
      new SetCollFactorE18TxBuilder(this.client, {
        config: this.params.config,
        mode: this.params.mode,
        pools: pools,
        factors_e18: collFactors,
      }),
    )

    // Set mode's pools borrow factors
    this.txBuilders.push(
      new SetBorrFactorE18TxBuilder(this.client, {
        config: this.params.config,
        mode: this.params.mode,
        pools: pools,
        factors_e18: borrFactors,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    _txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry>> {
    // no new address, do nothing
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
