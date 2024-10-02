import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  ConfigureReservesTxBuilder,
  ConfigureReservesTxBuilderParams,
} from '@actions/subactions/tx-builders/reservesSetupHelper/configReserves'

import { AaveV3Registry } from '@/src/type'

export type ConfigureReserveSubActionParams = ConfigureReservesTxBuilderParams

export class ConfigureReservesSubAction extends SubAction<ConfigureReserveSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: ConfigureReserveSubActionParams) {
    super(ConfigureReservesSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // configure reserve by helper
    const txBuilder = new ConfigureReservesTxBuilder(this.client, this.params)
    this.txBuilders.push(txBuilder)
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    // no new address, do nothing
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
