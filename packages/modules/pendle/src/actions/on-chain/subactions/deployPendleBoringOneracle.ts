import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployPendleBoringOneracleTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleBoringOneracle/deploy'

import { PendleV3Registry } from '@/src/type'

export type DeployPendleBoringOneracleMsg = {
  pendleBoringOneracle: Address
}

export class DeployPendleBoringOneracleSubAction extends SubAction<{}, PendleV3Registry, DeployPendleBoringOneracleMsg> {
  constructor(client: InfinitWallet, params: {}) {
    super(DeployPendleBoringOneracleSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- deploy pendle boring oneracle -----------
    this.txBuilders.push(new DeployPendleBoringOneracleTxBuilder(this.client, {}))
  }

  public async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployPendleBoringOneracleMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [deployPendleBoringOneracleHash] = txHashes

    // get contracts
    const { contractAddress: pendleBoringOneracle } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleBoringOneracleHash,
    })

    // check if the contract address is not found
    if (!pendleBoringOneracle) {
      throw new ContractNotFoundError(deployPendleBoringOneracleHash, 'PendleBoringOneracle')
    }

    // assign the contract address to the registry
    registry['pendleBoringOneracle'] = pendleBoringOneracle

    // construct the new message
    const newMessage: DeployPendleBoringOneracleMsg = {
      pendleBoringOneracle: pendleBoringOneracle,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
