import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetIrmTxBuilder, SetIrmTxBuilderParams } from '@actions/subactions/tx-builders/Pool/setIrm'

import { InitCapitalRegistry } from '@/src/type'

export type SetIrmSubActionParams = SetIrmTxBuilderParams

export class SetIrmSubAction extends SubAction<SetIrmSubActionParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: SetIrmSubActionParams) {
    super(SetIrmSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilderParams: SetIrmSubActionParams = {
      pool: this.params.pool,
      irm: this.params.irm,
    }
    this.txBuilders.push(new SetIrmTxBuilder(this.client, txBuilderParams))
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
