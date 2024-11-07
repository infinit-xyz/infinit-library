import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetBorrFactorE18TxBuilder } from '@actions/subactions/tx-builders/Config/setBorrFactors_e18'
import { SetCollFactorE18TxBuilder } from '@actions/subactions/tx-builders/Config/setCollFactors_e18'

import { InitCapitalRegistry } from '@/src/type'

export type PoolFactor = {
  pool: Address
  collFactor_e18: bigint
  borrFactor_e18: bigint
}

export type ModePoolFactor = {
  mode: number
  poolFactors: PoolFactor[]
}

export type SetModePoolFactorsSubActionParams = {
  config: Address
  modePoolFactors: ModePoolFactor[]
}

export class SetModePoolFactorsSubAction extends SubAction<SetModePoolFactorsSubActionParams, InitCapitalRegistry> {
  constructor(client: InfinitWallet, params: SetModePoolFactorsSubActionParams) {
    super(SetModePoolFactorsSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- set mode pools factors -----------
    for (const modePoolFactor of this.params.modePoolFactors) {
      this.txBuilders.push(
        new SetCollFactorE18TxBuilder(this.client, {
          config: this.params.config,
          mode: modePoolFactor.mode,
          pools: modePoolFactor.poolFactors.map((poolFactor) => poolFactor.pool),
          factors_e18: modePoolFactor.poolFactors.map((poolFactor) => poolFactor.collFactor_e18),
        }),
      )
      this.txBuilders.push(
        new SetBorrFactorE18TxBuilder(this.client, {
          config: this.params.config,
          mode: modePoolFactor.mode,
          pools: modePoolFactor.poolFactors.map((poolFactor) => poolFactor.pool),
          factors_e18: modePoolFactor.poolFactors.map((poolFactor) => poolFactor.borrFactor_e18),
        }),
      )
    }
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
