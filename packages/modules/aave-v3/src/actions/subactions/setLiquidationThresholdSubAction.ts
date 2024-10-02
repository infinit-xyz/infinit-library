import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  ConfigureReserveAsCollateralParams,
  ConfigureReserveAsCollateralTxBuilder,
} from '@actions/subactions/tx-builders/poolConfigurator/configureReserveAsCollateral'

import { AaveV3Registry } from '@/src/type'

export type liquidationThresholdInfo = {
  asset: Address
  liquidationThreshold: bigint
}

export type SetLiquidationThresholdSubActionParams = {
  liquidationThresholdInfos: liquidationThresholdInfo[]
  pool: Address
  poolConfigurator: Address
  aclManager: Address
}

export class SetLiquidationThresholdSubAction extends SubAction<SetLiquidationThresholdSubActionParams, object, object> {
  constructor(client: InfinitWallet, params: SetLiquidationThresholdSubActionParams) {
    super(SetLiquidationThresholdSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const liquidationThresholdInfo of this.params.liquidationThresholdInfos) {
      const txBuilderParams: ConfigureReserveAsCollateralParams = {
        asset: liquidationThresholdInfo.asset,
        pool: this.params.pool,
        poolConfigurator: this.params.poolConfigurator,
        aclManager: this.params.aclManager,
        liquidationThreshold: liquidationThresholdInfo.liquidationThreshold,
      }
      this.txBuilders.push(new ConfigureReserveAsCollateralTxBuilder(this.client, txBuilderParams))
    }
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
