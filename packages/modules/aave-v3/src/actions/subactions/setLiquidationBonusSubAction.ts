import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  ConfigureReserveAsCollateralParams,
  ConfigureReserveAsCollateralTxBuilder,
} from '@actions/subactions/tx-builders/poolConfigurator/configureReserveAsCollateral'

import { AaveV3Registry } from '@/src/type'

export type liquidationBonusInfo = {
  asset: Address
  liquidationBonus: bigint
}

export type SetLiquidationBonusSubActionParams = {
  liquidationBonusInfos: liquidationBonusInfo[]
  pool: Address
  poolConfigurator: Address
  aclManager: Address
}

export class SetLiquidationBonusSubAction extends SubAction<SetLiquidationBonusSubActionParams, object, object> {
  constructor(client: InfinitWallet, params: SetLiquidationBonusSubActionParams) {
    super(SetLiquidationBonusSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const liquidationBonusInfo of this.params.liquidationBonusInfos) {
      const txBuilderParams: ConfigureReserveAsCollateralParams = {
        asset: liquidationBonusInfo.asset,
        pool: this.params.pool,
        poolConfigurator: this.params.poolConfigurator,
        aclManager: this.params.aclManager,
        liquidationBonus: liquidationBonusInfo.liquidationBonus,
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
