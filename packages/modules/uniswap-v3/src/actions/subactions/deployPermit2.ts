import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployPermit2TxBuilder } from '@actions/subactions/tx-builders/Permit2/deploy'

import { UniswapV3Registry } from '@/src/type'

export type DeployPermit2Params = {}

export type DeployPermit2Msg = {
  permit2: Address
}

export class DeployPermit2SubAction extends SubAction<DeployPermit2Params, UniswapV3Registry, DeployPermit2Msg> {
  constructor(client: InfinitWallet, params: DeployPermit2Params) {
    super(DeployPermit2SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(new DeployPermit2TxBuilder(this.client))
  }

  public async updateRegistryAndMessage(
    registry: UniswapV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<UniswapV3Registry, DeployPermit2Msg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployPermit2Hash] = txHashes

    const { contractAddress: permit2 } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPermit2Hash,
    })
    if (!permit2) {
      throw new ContractNotFoundError(deployPermit2Hash, 'Permit2')
    }
    registry['permit2'] = permit2

    const newMessage: DeployPermit2Msg = {
      permit2,
    }

    return { newRegistry: registry, newMessage: newMessage }
  }
}
