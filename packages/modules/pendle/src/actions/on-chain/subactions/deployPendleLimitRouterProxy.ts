import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployTransparentUpgradeableProxyTxBuilder } from '@actions/on-chain/subactions/txBuilders/TransparentUpgradeableProxy/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployPendleLimitRouterProxySubActionParams = {
  proxyAdmin: Address
  pendleLimitRouterImpl: Address
}

export type DeployPendleLimitRouterProxyMsg = {
  pendleLimitRouterProxy: Address
}

export class DeployPendleLimitRouterProxySubAction extends SubAction<
  DeployPendleLimitRouterProxySubActionParams,
  PendleRegistry,
  DeployPendleLimitRouterProxyMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleLimitRouterProxySubActionParams) {
    super(DeployPendleLimitRouterProxySubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- deploy proxy point to implementation -----------
    this.txBuilders.push(
      new DeployTransparentUpgradeableProxyTxBuilder(this.client, {
        logic: this.params.pendleLimitRouterImpl,
        admin: this.params.proxyAdmin,
        data: '0x',
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendleLimitRouterProxyMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [deployPendleLimitRouterProxyHash] = txHashes

    // get the deployed address from the txHash
    const { contractAddress: pendleLimitRouterProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleLimitRouterProxyHash,
    })

    // check if the contract address is not found
    if (!pendleLimitRouterProxy) {
      throw new ContractNotFoundError(deployPendleLimitRouterProxyHash, 'PendleLimitRouterProxy')
    }

    // assign the contract address to the registry
    registry['pendleLimitRouterProxy'] = pendleLimitRouterProxy

    const newMessage: DeployPendleLimitRouterProxyMsg = {
      pendleLimitRouterProxy,
    }

    // return the new registry and new message
    return { newRegistry: registry, newMessage: newMessage }
  }
}
