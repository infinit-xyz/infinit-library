import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployProxyAdminTxBuilder } from '@actions/on-chain/subactions/txBuilders/ProxyAdmin/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployProxyAdminSubactionParams = {}

export type DeployProxyAdminMsg = {
  proxyAdmin: Address
}

export class DeployProxyAdminSubAction extends SubAction<DeployProxyAdminSubactionParams, PendleRegistry, DeployProxyAdminMsg> {
  constructor(client: InfinitWallet, params: DeployProxyAdminSubactionParams) {
    super(DeployProxyAdminSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(new DeployProxyAdminTxBuilder(this.client))
  }

  public async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployProxyAdminMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployProxyAdminHash] = txHashes

    const { contractAddress: proxyAdmin } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployProxyAdminHash,
    })
    if (!proxyAdmin) {
      throw new ContractNotFoundError(deployProxyAdminHash, 'ProxyAdmin')
    }
    registry['proxyAdmin'] = proxyAdmin

    const newMessage: DeployProxyAdminMsg = {
      proxyAdmin,
    }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
