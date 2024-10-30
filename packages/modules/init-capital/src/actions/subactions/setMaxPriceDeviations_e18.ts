import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  SetMaxPriceDeviations_e18TxBuilder,
  SetMaxPriceDeviations_e18TxBuilderParams,
} from '@actions/subactions/tx-builders/InitOracle/setMaxPriceDeviations_e18'

import { InitCapitalRegistry } from '@/src/type'

export type TokenMaxPriceDeviation = {
  token: Address
  maxPriceDeviation_e18: bigint
}
export type SetMaxPriceDeviations_e18SubActionParams = {
  initOracle: Address
  tokenMaxPriceDeviations: TokenMaxPriceDeviation[]
}
export class SetMaxPriceDeviations_e18SubAction extends SubAction<SetMaxPriceDeviations_e18SubActionParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: SetMaxPriceDeviations_e18SubActionParams) {
    super(SetMaxPriceDeviations_e18SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilderParams: SetMaxPriceDeviations_e18TxBuilderParams = {
      initOracle: this.params.initOracle,
      tokens: [] as Address[],
      maxPriceDeviations_e18s: [] as bigint[],
    }
    this.params.tokenMaxPriceDeviations.forEach((tokenMaxPriceDeviation) => {
      txBuilderParams.tokens.push(tokenMaxPriceDeviation.token)
      txBuilderParams.maxPriceDeviations_e18s.push(tokenMaxPriceDeviation.maxPriceDeviation_e18)
    })
    this.txBuilders.push(new SetMaxPriceDeviations_e18TxBuilder(this.client, txBuilderParams))
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
