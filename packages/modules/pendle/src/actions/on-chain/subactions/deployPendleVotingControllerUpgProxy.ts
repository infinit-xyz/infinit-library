import { Address, Hash, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import { DeployERC1967ProxyTxBuilder } from '@actions/on-chain/subactions/txBuilders/ERC1967Proxy/deploy'

import { PendleV3Registry } from '@/src/type'

export type DeployPendleMsgSendEndpointUpgProxySubactionParams = {
  implementation: Address
  data: Hex
}
export type DeployPendleVotingControllerUpgProxySubactionMsg = {
  pendleVotingControllerUpgProxy: Address
}

export class DeployPendleVotingControllerUpgProxySubaction extends SubAction<
  DeployPendleMsgSendEndpointUpgProxySubactionParams,
  PendleV3Registry,
  DeployPendleVotingControllerUpgProxySubactionMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleMsgSendEndpointUpgProxySubactionParams) {
    super(DeployPendleVotingControllerUpgProxySubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployERC1967ProxyTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployPendleVotingControllerUpgProxySubactionMsg>> {
    const [deployPendleVotingControllerUpgProxyTxHash] = txHashes
    const { contractAddress: erc1967Proxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleVotingControllerUpgProxyTxHash,
    })
    if (!erc1967Proxy) {
      throw new ContractNotFoundError(deployPendleVotingControllerUpgProxyTxHash, 'erc1967')
    }
    registry.pendleVotingControllerUpgProxy = erc1967Proxy

    const newMessage = {
      pendleVotingControllerUpgProxy: erc1967Proxy,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
