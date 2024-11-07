import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  SetMerkleRootTxBuilder,
  SetMerkleRootTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/AccumulativeMerkleDistributor/setMerkleRoot'

import { TokenRegistry } from '@/src/type'

export type SetMerkleRootSubActionParams = SetMerkleRootTxBuilderParams

export class SetMerkleRootSubAction extends SubAction<SetMerkleRootSubActionParams, object, object> {
  constructor(client: InfinitWallet, params: SetMerkleRootSubActionParams) {
    super(SetMerkleRootSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilderParams: SetMerkleRootSubActionParams = {
      accumulativeMerkleDistributor: this.params.accumulativeMerkleDistributor,
      root: this.params.root,
    }
    this.txBuilders.push(new SetMerkleRootTxBuilder(this.client, txBuilderParams))
  }

  protected async updateRegistryAndMessage(registry: TokenRegistry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<TokenRegistry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
