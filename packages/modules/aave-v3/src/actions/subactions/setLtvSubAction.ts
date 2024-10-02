import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  ConfigureReserveAsCollateralParams,
  ConfigureReserveAsCollateralTxBuilder,
} from '@actions/subactions/tx-builders/poolConfigurator/configureReserveAsCollateral'

import { AaveV3Registry } from '@/src/type'

export type LtvInfo = {
  asset: Address
  ltv: bigint
}

export type SetLtvSubActionParams = {
  ltvInfos: LtvInfo[]
  pool: Address
  poolConfigurator: Address
  aclManager: Address
}

export class SetLtvSubAction extends SubAction<SetLtvSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: SetLtvSubActionParams) {
    super(SetLtvSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const ltvInfo of this.params.ltvInfos) {
      const txBuilderParams: ConfigureReserveAsCollateralParams = {
        asset: ltvInfo.asset,
        pool: this.params.pool,
        poolConfigurator: this.params.poolConfigurator,
        aclManager: this.params.aclManager,
        ltv: BigInt(ltvInfo.ltv),
      }
      const txBuilder = new ConfigureReserveAsCollateralTxBuilder(this.client, txBuilderParams)
      this.txBuilders.push(txBuilder)
    }
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
