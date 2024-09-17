import _ from 'lodash'

import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployInfinitERC20TxBuilder,
  DeployInfinitERC20TxBuilderParams,
} from '@actions/subactions/txBuilders/InfinitERC20/deployInfinitERC20'

import { Token, TokenRegistry, TokenType } from '@/src/type'

export type DeployInfinitERC20SubActionParams = {
  owner: Address
  name: string
  symbol: string
  maxSupply: bigint
  initialSupply: bigint
}

export class DeployInfinitERC20SubAction extends SubAction<DeployInfinitERC20SubActionParams, Object, Object> {
  constructor(client: InfinitWallet, params: DeployInfinitERC20SubActionParams) {
    super(DeployInfinitERC20SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilderParams: DeployInfinitERC20TxBuilderParams = {
      owner: this.params.owner,
      name: this.params.name,
      symbol: this.params.symbol,
      maxSupply: this.params.maxSupply,
      initialSupply: this.params.initialSupply,
    }
    this.txBuilders.push(new DeployInfinitERC20TxBuilder(this.client, txBuilderParams))
  }

  protected async updateRegistryAndMessage(
    registry: TokenRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<TokenRegistry, {}>> {
    const deployInfinitERC20Hash = txHashes[0]
    const { contractAddress: tokenAddr } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployInfinitERC20Hash })
    if (!tokenAddr) {
      throw new ContractNotFoundError(deployInfinitERC20Hash, 'InfinitERC20')
    }

    const deployedToken: Token = {
      tokenAddress: tokenAddr,
      type: TokenType.InfinitERC20,
    }

    _.set(registry, ['tokens', tokenAddr], deployedToken)
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
