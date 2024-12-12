import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployPendleRouterV4TxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouter/deploy'
import { DeployPendleRouterStaticTxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouterStatic/deploy'
import { PendleRegistry } from '@/src/type'

export type DeployPendleRouterContractSubactionParams = {
  owner: Address
  routerStorageV4: Address
  actionStorageStatic: Address
}

export type DeployPendleRouterContractMsg_2 = {
  pendleRouterV4: Address
  pendleRouterStatic: Address
  pendleLimitRouterProxy: Address
}

export class DeployPendleRouterContract1SubAction extends SubAction<
  DeployPendleRouterContractSubactionParams,
  PendleRegistry,
  DeployPendleRouterContractMsg_2
> {
  constructor(client: InfinitWallet, params: DeployPendleRouterContractSubactionParams) {
    super(DeployPendleRouterContract1SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(
      new DeployPendleRouterV4TxBuilder(this.client, {
        owner: this.params.owner,
        actionStorage: this.params.routerStorageV4,
      }),
    )
    this.txBuilders.push(
      new DeployPendleRouterStaticTxBuilder(this.client, {
        storageLayout: this.params.actionStorageStatic,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendleRouterContractMsg_2>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployPendleRouterV4Hash, deployPendleRouterStaticHash, deployPendleLimitRouterProxyHash] = txHashes

    const { contractAddress: pendleRouterV4 } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleRouterV4Hash,
    })
    if (!pendleRouterV4) {
      throw new ContractNotFoundError(deployPendleRouterV4Hash, 'PendleRouterV4')
    }
    registry['pendleRouter'] = pendleRouterV4

    const { contractAddress: pendleRouterStatic } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleRouterStaticHash,
    })
    if (!pendleRouterStatic) {
      throw new ContractNotFoundError(deployPendleRouterStaticHash, 'PendleRouterStatic')
    }
    registry['pendleRouterStatic'] = pendleRouterStatic

    const { contractAddress: pendleLimitRouterProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleLimitRouterProxyHash,
    })
    if (!pendleLimitRouterProxy) {
      throw new ContractNotFoundError(deployPendleLimitRouterProxyHash, 'PendleLimitRouterProxy')
    }
    registry['pendleLimitRouterProxy'] = pendleLimitRouterProxy

    const newMessage: DeployPendleRouterContractMsg_2 = {
      pendleRouterV4,
      pendleRouterStatic,
      pendleLimitRouterProxy,
    }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
