import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { MintTxBuilder, MintTxBuilderParams } from './txBuilders/InfinitERC20/mint'
import { TokenRegistry } from '@/src/type'

export type MintInfinitERC20SubActionParams = {
  token: Address
  receivers: Address[]
  amounts: bigint[]
}

export class MintInfinitERC20SubAction extends SubAction<MintInfinitERC20SubActionParams, Object, Object> {
  constructor(client: InfinitWallet, params: MintInfinitERC20SubActionParams) {
    super(MintInfinitERC20SubAction.name, client, params)

    if (params.receivers.length !== params.amounts.length) {
      throw new ValidateInputValueError('receivers and amounts must have the same length')
    }
  }

  protected setTxBuilders(): void {
    for (let i = 0; i < this.params.receivers.length; i++) {
      const txBuilderParams: MintTxBuilderParams = {
        token: this.params.token,
        receiver: this.params.receivers[i],
        amount: this.params.amounts[i],
      }
      this.txBuilders.push(new MintTxBuilder(this.client, txBuilderParams))
    }
  }

  protected async updateRegistryAndMessage(
    registry: TokenRegistry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<TokenRegistry, {}>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
