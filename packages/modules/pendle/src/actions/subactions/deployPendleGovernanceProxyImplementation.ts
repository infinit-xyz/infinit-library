import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployPendleGovernanceProxyTxBuilder } from '@actions/subactions/tx-builders/PendleGovernanceProxy/deploy'

import { PendleV3Registry } from '@/src/type'

export type DeployPendleGovernanceProxyImplMsg = {
  pendleGovernanceProxyImpl: Address
}

export class DeployPendleGovernanceProxyImplementationSubAction extends SubAction<{}, PendleV3Registry, DeployPendleGovernanceProxyImplMsg> {
  constructor(client: InfinitWallet, params: {}) {
    super(DeployPendleGovernanceProxyImplementationSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- deploy pendle governance proxy impl -----------
    this.txBuilders.push(new DeployPendleGovernanceProxyTxBuilder(this.client, {}))
  }

  public async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployPendleGovernanceProxyImplMsg>> {
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
      throw new ContractNotFoundError(pendleGovernanceProxyHash, 'PendleGovernanceProxyImpl')
    }

    // assign the contract address to the registry
    registry['pendleGovernanceProxyImpl'] = pendleGovernanceProxy

    // construct the new message
    const newMessage: DeployPendleGovernanceProxyImplMsg = {
      pendleGovernanceProxyImpl: pendleGovernanceProxy,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
