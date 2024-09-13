import { Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployUniversalRouterTxBuilder,
  DeployUniversalRouterTxBuilderParams,
} from '@actions/subactions/tx-builders/UniversalRouter/deploy'

import { UniswapV3Registry } from '@/src/type'

export type DeployUniversalRouterParams = DeployUniversalRouterTxBuilderParams

export class DeployUniversalRouterSubAction extends SubAction<DeployUniversalRouterParams, UniswapV3Registry, Object> {
  constructor(client: InfinitWallet, params: DeployUniversalRouterParams) {
    super(DeployUniversalRouterSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(new DeployUniversalRouterTxBuilder(this.client, this.params))
  }

  public async updateRegistryAndMessage(
    registry: UniswapV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<UniswapV3Registry, Object>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployUniversalRouterHash] = txHashes

    const { contractAddress: universalRouter } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployUniversalRouterHash,
    })
    if (!universalRouter) {
      throw new ContractNotFoundError(deployUniversalRouterHash, 'UniversalRouter')
    }
    registry['universalRouter'] = universalRouter

    return { newRegistry: registry, newMessage: {} }
  }
}
