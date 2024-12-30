import { Address, Hash, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import { DeployERC1967ProxyTxBuilder } from '@actions/on-chain/subactions/txBuilders/ERC1967Proxy/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployPendleMsgSendEndpointUpgProxySubactionParams = {
  implementation: Address
  data: Hex
}
export type DeployPendleMsgSendEndpointUpgProxySubactionMsg = {
  pendleMsgSendEndpointUpgProxy: Address
}

export class DeployPendleMsgSendEndpointUpgProxySubaction extends SubAction<
  DeployPendleMsgSendEndpointUpgProxySubactionParams,
  PendleRegistry,
  DeployPendleMsgSendEndpointUpgProxySubactionMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleMsgSendEndpointUpgProxySubactionParams) {
    super(DeployPendleMsgSendEndpointUpgProxySubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployERC1967ProxyTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendleMsgSendEndpointUpgProxySubactionMsg>> {
    const [deployPendleMsgSendEndpointUpgProxyTxHash] = txHashes
    const { contractAddress: erc1967Proxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleMsgSendEndpointUpgProxyTxHash,
    })
    if (!erc1967Proxy) {
      throw new ContractNotFoundError(deployPendleMsgSendEndpointUpgProxyTxHash, 'erc1967')
    }
    registry.pendleMsgSendEndpointUpgProxy = erc1967Proxy

    const newMessage = {
      pendleMsgSendEndpointUpgProxy: erc1967Proxy,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
