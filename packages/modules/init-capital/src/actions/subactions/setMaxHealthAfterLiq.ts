import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  SetMaxHealthAfterLiqE18TxBuilder,
  SetMaxHealthAfterLiqE18TxBuilderParams,
} from '@actions/subactions/tx-builders/Config/setMaxHealthAfterLiq_e18'

import { InitCapitalRegistry } from '@/src/type'

export type MaxHealthAfterLiqConfig = {
  mode: number
  maxHealthAfterLiqE18: bigint
}

export type SetMaxHealthAfterLiqSubActionParams = {
  config: Address
  maxHealthAfterLiqConfigs: MaxHealthAfterLiqConfig[]
}

export class SetMaxHealthAfterLiqSubAction extends SubAction<SetMaxHealthAfterLiqSubActionParams, InitCapitalRegistry> {
  constructor(client: InfinitWallet, params: SetMaxHealthAfterLiqSubActionParams) {
    super(SetMaxHealthAfterLiqSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // set mode's max health after liquidation
    for (const maxHealthAfterLiqConfig of this.params.maxHealthAfterLiqConfigs) {
      if (maxHealthAfterLiqConfig.maxHealthAfterLiqE18) {
        const setMaxHealthAfterLiqE18TxBuilderParams: SetMaxHealthAfterLiqE18TxBuilderParams = {
          config: this.params.config,
          mode: maxHealthAfterLiqConfig.mode,
          maxHealthAfterLiq_e18: maxHealthAfterLiqConfig.maxHealthAfterLiqE18,
        }
        const setMaxHealthAfterLiqE18TxBuilder = new SetMaxHealthAfterLiqE18TxBuilder(this.client, setMaxHealthAfterLiqE18TxBuilderParams)
        this.txBuilders.push(setMaxHealthAfterLiqE18TxBuilder)
      }
    }
  }

  protected async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
