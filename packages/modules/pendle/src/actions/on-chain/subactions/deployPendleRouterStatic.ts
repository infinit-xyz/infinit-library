import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployPendleRouterStaticTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleRouterStatic/deploy'

import { PendleV3Registry } from '@/src/type'

export type DeployPendleRouterStaticSubactionParams = {
  actionStorageStatic: Address
}

export type DeployPendleRouterStaticMsg = {
  pendleRouterStatic: Address
}

export class DeployPendleRouterStaticSubAction extends SubAction<
  DeployPendleRouterStaticSubactionParams,
  PendleV3Registry,
  DeployPendleRouterStaticMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleRouterStaticSubactionParams) {
    super(DeployPendleRouterStaticSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(
      new DeployPendleRouterStaticTxBuilder(this.client, {
        storageLayout: this.params.actionStorageStatic,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployPendleRouterStaticMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployPendleRouterStaticHash] = txHashes

    const { contractAddress: pendleRouterStatic } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleRouterStaticHash,
    })
    if (!pendleRouterStatic) {
      throw new ContractNotFoundError(deployPendleRouterStaticHash, 'PendleRouterStatic')
    }
    registry['pendleRouterStatic'] = pendleRouterStatic

    const newMessage: DeployPendleRouterStaticMsg = {
      pendleRouterStatic,
    }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
