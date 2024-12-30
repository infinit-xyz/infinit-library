import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployPendleMulticallV2TxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleMulticallV2/deploy'

import { PendleV3Registry } from '@/src/type'

export type DeployPendleMulticallV2SubActionParams = {}

export type DeployPendleMulticallV2Msg = {
  pendleMulticallV2: Address
}

export class DeployPendleMulticallV2SubAction extends SubAction<
  DeployPendleMulticallV2SubActionParams,
  PendleV3Registry,
  DeployPendleMulticallV2Msg
> {
  constructor(client: InfinitWallet, params: DeployPendleMulticallV2SubActionParams) {
    super(DeployPendleMulticallV2SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- deploy pendle multicall v2 -----------
    this.txBuilders.push(new DeployPendleMulticallV2TxBuilder(this.client))
  }

  public async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployPendleMulticallV2Msg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [deployPendleMulticallV2Hash] = txHashes

    // get the deployed address from the txHash
    const { contractAddress: pendleMulticallV2 } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleMulticallV2Hash,
    })

    // check if the contract address is not found
    if (!pendleMulticallV2) {
      throw new ContractNotFoundError(deployPendleMulticallV2Hash, 'PendleMulticallV2')
    }

    // assign the contract address to the registry
    registry['pendleMulticallV2'] = pendleMulticallV2

    // construct the new message
    const newMessage: DeployPendleMulticallV2Msg = {
      pendleMulticallV2,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
