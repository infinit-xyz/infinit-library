import { Address, Hash, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import { DeployERC1967ProxyTxBuilder } from '@actions/on-chain/subactions/txBuilders/ERC1967Proxy/deploy'

import { PendleV3Registry } from '@/src/type'

export type DeployPendleGaugeControllerMainchainUpgProxySubactionParams = {
  implementation: Address
  data: Hex
}
export type DeployPendleGaugeControllerMainchainUpgProxySubactionMsg = {
  pendleGaugeControllerMainchainUpgProxy: Address
}

export class DeployPendleGaugeControllerMainchainUpgProxySubaction extends SubAction<
  DeployPendleGaugeControllerMainchainUpgProxySubactionParams,
  PendleV3Registry,
  DeployPendleGaugeControllerMainchainUpgProxySubactionMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleGaugeControllerMainchainUpgProxySubactionParams) {
    super(DeployPendleGaugeControllerMainchainUpgProxySubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployERC1967ProxyTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployPendleGaugeControllerMainchainUpgProxySubactionMsg>> {
    const [deployPendleGaugeControllerMainchainUpgProxyTxHash] = txHashes
    const { contractAddress: erc1967Proxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleGaugeControllerMainchainUpgProxyTxHash,
    })
    if (!erc1967Proxy) {
      throw new ContractNotFoundError(deployPendleGaugeControllerMainchainUpgProxyTxHash, 'erc1967')
    }
    registry.pendleGaugeControllerMainchainUpgProxy = erc1967Proxy

    const newMessage = {
      pendleGaugeControllerMainchainUpgProxy: erc1967Proxy,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
