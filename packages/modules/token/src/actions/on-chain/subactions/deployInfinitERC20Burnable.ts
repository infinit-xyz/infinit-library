import _ from 'lodash'

import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployInfinitERC20BurnableTxBuilderParams,
  deployInfinitERC20BurnableTxBuilder,
} from '@actions/on-chain/subactions/txBuilders/InfinitERC20Burnable/deployInfinitERC20Burnable'

import { Token, TokenRegistry, TokenType } from '@/src/type'

export type DeployInfinitERC20BurnableSubActionParams = {
  owner: Address
  name: string
  symbol: string
  maxSupply: bigint
  initialSupply: bigint
}

export class DeployInfinitERC20BurnableSubAction extends SubAction<DeployInfinitERC20BurnableSubActionParams, object, object> {
  constructor(client: InfinitWallet, params: DeployInfinitERC20BurnableSubActionParams) {
    super(DeployInfinitERC20BurnableSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const txBuilderParams: DeployInfinitERC20BurnableTxBuilderParams = {
      owner: this.params.owner,
      name: this.params.name,
      symbol: this.params.symbol,
      maxSupply: this.params.maxSupply,
      initialSupply: this.params.initialSupply,
    }
    this.txBuilders.push(new deployInfinitERC20BurnableTxBuilder(this.client, txBuilderParams))
  }

  protected async updateRegistryAndMessage(registry: TokenRegistry, txHashes: Hash[]): Promise<SubActionExecuteResponse<TokenRegistry>> {
    const deployInfinitERC20BurnableHash = txHashes[0]
    const { contractAddress: tokenAddr } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployInfinitERC20BurnableHash,
    })
    if (!tokenAddr) {
      throw new ContractNotFoundError(deployInfinitERC20BurnableHash, 'InfinitERC20Burnable')
    }

    const deployedToken: Token = {
      type: TokenType.InfinitERC20Burnable,
    }

    _.set(registry, ['tokens', tokenAddr], deployedToken)
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
