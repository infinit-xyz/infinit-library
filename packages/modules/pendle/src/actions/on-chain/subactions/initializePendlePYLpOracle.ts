import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  InitializePendlePYLpOracleTxBuilder,
  InitializePendlePYLpOracleTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendlePYLpOracle/initialize'

import { PendleRegistry } from '@/src/type'

export type InitializePendlePYLpOracleSubactionParams = InitializePendlePYLpOracleTxBuilderParams
export class InitializePendlePYLpOracleSubaction extends SubAction<InitializePendlePYLpOracleSubactionParams, PendleRegistry> {
  constructor(client: InfinitWallet, params: InitializePendlePYLpOracleSubactionParams) {
    super(InitializePendlePYLpOracleSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new InitializePendlePYLpOracleTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(registry: PendleRegistry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<PendleRegistry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
