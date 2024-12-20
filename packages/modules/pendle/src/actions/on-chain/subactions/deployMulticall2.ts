import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployMulticall2TxBuilder } from '@actions/on-chain/subactions/txBuilders/Multicall2/deploy'

import { PendleV3Registry } from '@/src/type'

export type DeployMulticall2SubActionParams = {}

export type DeployMulticall2Msg = {
  multicall: Address
}

export class DeployMulticall2SubAction extends SubAction<DeployMulticall2SubActionParams, PendleV3Registry, DeployMulticall2Msg> {
  constructor(client: InfinitWallet, params: DeployMulticall2SubActionParams) {
    super(DeployMulticall2SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- deploy multicall2 -----------
    this.txBuilders.push(new DeployMulticall2TxBuilder(this.client))
  }

  public async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployMulticall2Msg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [deployMulticall2Hash] = txHashes

    // get the deployed address from the txHash
    const { contractAddress: multicall } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployMulticall2Hash,
    })

    // check if the contract address is not found
    if (!multicall) {
      throw new ContractNotFoundError(deployMulticall2Hash, 'Multicall2')
    }

    // assign the contract address to the registry
    registry['multicall'] = multicall

    // construct the new message
    const newMessage: DeployMulticall2Msg = {
      multicall,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
