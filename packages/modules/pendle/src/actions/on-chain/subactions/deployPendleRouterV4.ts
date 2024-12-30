import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployPendleRouterV4TxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleRouter/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployPendleRouterV4SubactionParams = {
  owner: Address
  routerStorageV4: Address
}

export type DeployPendleRouterV4Msg = {
  pendleRouterV4: Address
}

export class DeployPendleRouterV4SubAction extends SubAction<DeployPendleRouterV4SubactionParams, PendleRegistry, DeployPendleRouterV4Msg> {
  constructor(client: InfinitWallet, params: DeployPendleRouterV4SubactionParams) {
    super(DeployPendleRouterV4SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(
      new DeployPendleRouterV4TxBuilder(this.client, {
        owner: this.params.owner,
        actionStorage: this.params.routerStorageV4,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendleRouterV4Msg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployPendleRouterV4Hash] = txHashes

    const { contractAddress: pendleRouterV4 } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleRouterV4Hash,
    })
    if (!pendleRouterV4) {
      throw new ContractNotFoundError(deployPendleRouterV4Hash, 'PendleRouterV4')
    }
    registry['pendleRouterV4'] = pendleRouterV4

    const newMessage: DeployPendleRouterV4Msg = {
      pendleRouterV4,
    }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
