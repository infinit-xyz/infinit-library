import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  SetLiqIncentiveCalculatorTxBuilder,
  SetLiqIncentiveCalculatorTxBuilderParams,
} from '@actions/subactions/tx-builders/InitCore/setLiqIncentiveCalculator'

import { InitCapitalRegistry } from '@/src/type'

export class SetLiqIncentiveCalculatorSubAction extends SubAction<SetLiqIncentiveCalculatorTxBuilderParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: SetLiqIncentiveCalculatorTxBuilderParams) {
    super(SetLiqIncentiveCalculatorSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(new SetLiqIncentiveCalculatorTxBuilder(this.client, this.params))
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
