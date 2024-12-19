import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { InitializePendlePYLpOracleTxBuilder, InitializePendlePYLpOracleTxBuilderParams } from './tx-builders/PendlePYLpOracle/initialize'
import { PendleV3Registry } from '@/src/type'

export type InitializePendlePYLpOracleSubactionParams = InitializePendlePYLpOracleTxBuilderParams
export class DeployPendlePYLpOracleSubaction extends SubAction<InitializePendlePYLpOracleSubactionParams, PendleV3Registry> {
  constructor(client: InfinitWallet, params: InitializePendlePYLpOracleSubactionParams) {
    super(DeployPendlePYLpOracleSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new InitializePendlePYLpOracleTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleV3Registry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
