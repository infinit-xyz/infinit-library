import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployERC1967ProxyTxBuilder } from '@actions/on-chain/subactions/txBuilders/ERC1967Proxy/deploy'

import { PendleV3Registry } from '@/src/type'

export type DeployProxyPendleGovernanceProxySubActionParams = {
  implementation: Address
}

export type DeployProxyPendleGovernanceProxyMsg = {
  pendleGovernanceProxy: Address
}

export class DeployProxyPendleGovernanceProxySubAction extends SubAction<
  DeployProxyPendleGovernanceProxySubActionParams,
  PendleV3Registry,
  DeployProxyPendleGovernanceProxyMsg
> {
  constructor(client: InfinitWallet, params: DeployProxyPendleGovernanceProxySubActionParams) {
    super(DeployProxyPendleGovernanceProxySubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- deploy erc1967 proxy -----------
    this.txBuilders.push(
      new DeployERC1967ProxyTxBuilder(this.client, {
        implementation: this.params.implementation,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployProxyPendleGovernanceProxyMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [pendleGovernanceProxyHash] = txHashes

    // get the deployed address from the txHash
    const { contractAddress: pendleGovernanceProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: pendleGovernanceProxyHash,
    })

    // check if the contract address is not found
    if (!pendleGovernanceProxy) {
      throw new ContractNotFoundError(pendleGovernanceProxyHash, 'PendleGovernanceProxy')
    }

    // assign the contract address to the registry
    registry['pendleGovernanceProxy'] = pendleGovernanceProxy

    // construct the new message
    const newMessage: DeployProxyPendleGovernanceProxyMsg = {
      pendleGovernanceProxy,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
