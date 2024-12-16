import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployPendleLimitRouterTxBuilder } from '@/src/actions/on-chain/subactions/txBuilders/PendleLimitRouter/deploy'
import { PendleRegistry } from '@/src/type'

export type DeployPendleLimitRouterSubactionParams = {
  wrappedNativeToken: Address
}

export type DeployPendleLimitRouterMsg = {
  pendleLimitRouter: Address
}

export class DeployPendleLimitRouter1SubAction extends SubAction<
  DeployPendleLimitRouterSubactionParams,
  PendleRegistry,
  DeployPendleLimitRouterMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleLimitRouterSubactionParams) {
    super(DeployPendleLimitRouter1SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(new DeployPendleLimitRouterTxBuilder(this.client, { wrappedNativeToken: this.params.wrappedNativeToken }))
  }

  public async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendleLimitRouterMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployPendleLimitRouterHash] = txHashes

    const { contractAddress: pendleLimitRouter } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleLimitRouterHash,
    })
    if (!pendleLimitRouter) {
      throw new ContractNotFoundError(deployPendleLimitRouterHash, 'PendleLimitRouter')
    }
    registry['pendleLimitRouter'] = pendleLimitRouter

    const newMessage: DeployPendleLimitRouterMsg = {
      pendleLimitRouter,
    }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
