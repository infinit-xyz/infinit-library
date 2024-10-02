import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  ConfigureReserveAsCollateralParams,
  ConfigureReserveAsCollateralTxBuilder,
} from '@actions/subactions/tx-builders/poolConfigurator/configureReserveAsCollateral'

import { AaveV3Registry } from '@/src/type'

export type CollateralInfo = {
  asset: Address
  ltv: bigint
  liquidationThreshold: bigint
  liquidationBonus: bigint
}

export type SetCollateralSubActionParams = {
  collateralInfos: CollateralInfo[]
  pool: Address
  poolConfigurator: Address
  aclManager: Address
}

export class SetCollateralSubAction extends SubAction<SetCollateralSubActionParams, object, object> {
  constructor(client: InfinitWallet, params: SetCollateralSubActionParams) {
    super(SetCollateralSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const collateralInfo of this.params.collateralInfos) {
      const txBuilderParams: ConfigureReserveAsCollateralParams = {
        asset: collateralInfo.asset,
        pool: this.params.pool,
        poolConfigurator: this.params.poolConfigurator,
        aclManager: this.params.aclManager,
        ltv: collateralInfo.ltv,
        liquidationThreshold: collateralInfo.liquidationThreshold,
        liquidationBonus: collateralInfo.liquidationBonus,
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
