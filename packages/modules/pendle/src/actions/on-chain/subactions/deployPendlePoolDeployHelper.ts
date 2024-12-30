import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployPendlePoolDeployHelperTxBuilder,
  DeployPendlePoolDeployHelperTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendlePoolDeployHelper/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployPendlePoolDeployHelperSubActionParams = DeployPendlePoolDeployHelperTxBuilderParams

export type DeployPendlePoolDeployHelperMsg = {
  pendlePoolDeployHelper: Address
}

export class DeployPendlePoolDeployHelperSubAction extends SubAction<
  DeployPendlePoolDeployHelperSubActionParams,
  PendleRegistry,
  DeployPendlePoolDeployHelperMsg
> {
  constructor(client: InfinitWallet, params: DeployPendlePoolDeployHelperSubActionParams) {
    super(DeployPendlePoolDeployHelperSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- deploy pendle pool deployer helper -----------
    this.txBuilders.push(
      new DeployPendlePoolDeployHelperTxBuilder(this.client, {
        router: this.params.router,
        yieldContractFactory: this.params.yieldContractFactory,
        marketFactory: this.params.marketFactory,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendlePoolDeployHelperMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [deployPendlePoolDeployHelperHash] = txHashes

    // get the deployed address from the txHash
    const { contractAddress: pendleGovernanceProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendlePoolDeployHelperHash,
    })

    // check if the contract address is not found
    if (!pendleGovernanceProxy) {
      throw new ContractNotFoundError(deployPendlePoolDeployHelperHash, 'PendlePoolDeployHelper')
    }

    // assign the contract address to the registry
    registry['pendlePoolDeployHelper'] = pendleGovernanceProxy

    // construct the new message
    const newMessage: DeployPendlePoolDeployHelperMsg = {
      pendlePoolDeployHelper: pendleGovernanceProxy,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
